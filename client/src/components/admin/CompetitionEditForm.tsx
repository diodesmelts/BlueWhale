import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Competition } from "@shared/schema";
import { Loader2, Upload, Link, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Simple schema - date handling is done on the server
const competitionUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  organizer: z.string().min(2, "Organizer must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().min(1, "Image is required"), // Changed from URL validation to allow file uploads
  platform: z.string().default("Other"),
  // Removed type field as requested
  prize: z.coerce.number().min(1, "Prize must be at least £1"),
  entries: z.coerce.number().default(0),
  // Removed eligibility field as requested
  // Removed endDate - we only use drawTime for countdown functionality
  drawTime: z.string().min(1, "Draw date and time is required"),
  entrySteps: z.array(
    z.object({
      id: z.number(),
      description: z.string().min(3, "Step description is required"),
      link: z.string().optional(),
    })
  ).default([]),
  isVerified: z.boolean().default(false),
  ticketPrice: z.coerce.number().default(0),
  maxTicketsPerUser: z.coerce.number().default(10),
  totalTickets: z.coerce.number().default(1000),
  soldTickets: z.coerce.number().default(0),
});

type CompetitionUpdateFormValues = z.infer<typeof competitionUpdateSchema>;

interface CompetitionEditFormProps {
  competition: Competition;
  onClose: () => void;
}

export function CompetitionEditForm({ competition, onClose }: CompetitionEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debug logging to understand the data types we're working with
  console.log('Competition drawTime type:', typeof competition.drawTime);
  console.log('Competition drawTime value:', competition.drawTime);
  
  // Get YYYY-MM-DD from a date object or ISO date string
  function getDateString(dateValue: string | Date | null | undefined): string {
    if (!dateValue) return '';
    try {
      if (typeof dateValue === 'string') {
        // Take just the date part (first 10 chars) of ISO string
        return dateValue.substring(0, 10);
      } else {
        // Format Date object to YYYY-MM-DD for input[type=date]
        return dateValue.toISOString().substring(0, 10);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
  
  // Set up the form with existing competition values
  const form = useForm<CompetitionUpdateFormValues>({
    resolver: zodResolver(competitionUpdateSchema),
    defaultValues: {
      title: competition.title,
      organizer: competition.organizer,
      description: competition.description,
      image: competition.image,
      platform: "Other", // Default value
      // Removed type field
      prize: competition.prize,
      entries: competition.entries || 0,
      // Removed eligibility field
      // Removed endDate - we now use drawTime only
      drawTime: competition.drawTime ? competition.drawTime.toString().substring(0, 16) : '', // Format as YYYY-MM-DDThh:mm
      entrySteps: [], // Empty array as we're removing this field
      isVerified: competition.isVerified || false,
      ticketPrice: competition.ticketPrice || 0,
      maxTicketsPerUser: competition.maxTicketsPerUser || 10,
      totalTickets: competition.totalTickets || 1000,
      soldTickets: competition.soldTickets || 0,
    }
  });

  // Update form mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CompetitionUpdateFormValues) => {
      // The endDate is already transformed into an ISO string by the zod schema
      // Format the data for the API
      const formattedData = {
        ...data,
        platform: "Other",
        entrySteps: [],
        // The endDate is already in ISO format thanks to our schema transform
      };
      
      console.log('Submission data:', formattedData);
      const res = await apiRequest('PUT', `/api/admin/competitions/${competition.id}`, formattedData);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update competition');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/competitions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
      
      toast({
        title: "Competition updated",
        description: "The competition has been successfully updated.",
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating competition",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Image upload handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    try {
      setUploadingImage(true);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Create preview URL for the UI
      const previewUrl = URL.createObjectURL(file);
      setUploadedImagePreview(previewUrl);
      
      // Upload the file to the server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      const imageUrl = data.url;
      
      // Update the form with the new image URL
      form.setValue('image', imageUrl);
      setUploadedImageUrl(imageUrl);
      
      toast({
        title: 'Image uploaded',
        description: 'The image has been successfully uploaded.',
      });
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      handleFileUpload(file);
    }
  };
  
  // Form submission handler
  const onSubmit = async (data: CompetitionUpdateFormValues) => {
    setLoading(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competition Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ultimate Gaming Setup Giveaway" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="organizer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organizer</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. TechReviewer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the competition and what the winner will receive" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Competition Image</FormLabel>
              <div className="space-y-4">
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <Link className="h-4 w-4 mr-2" />
                      Image URL
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="pt-4">
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription className="mt-2">
                      Enter a URL to an image that represents this competition
                    </FormDescription>
                  </TabsContent>
                  <TabsContent value="upload" className="pt-4">
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div 
                              className="bg-slate-100 w-full h-48 flex items-center justify-center border-b" 
                            >
                              {uploadedImagePreview ? (
                                <img 
                                  src={uploadedImagePreview}
                                  alt="Upload preview" 
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <ImageIcon className="h-12 w-12 text-slate-300" />
                              )}
                            </div>
                            <div className="p-4">
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                              />
                              <Button 
                                type="button" 
                                variant="outline"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                              >
                                {uploadingImage ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    {uploadedImagePreview ? 'Change Image' : 'Select Image File'}
                                  </>
                                )}
                              </Button>
                              {uploadedFile && (
                                <p className="text-sm text-slate-500 mt-2 truncate">
                                  Selected: {uploadedFile.name}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <FormDescription>
                        Upload an image file from your device (max 5MB)
                      </FormDescription>
                    </div>
                  </TabsContent>
                </Tabs>
                {field.value && field.value.startsWith('http') && (
                  <div className="mt-2 rounded overflow-hidden border w-full h-32 bg-slate-50 flex items-center justify-center">
                    <img 
                      src={field.value} 
                      alt="Current image" 
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                      }}
                    />
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Type and Eligibility fields removed as requested */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="prize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prize Value (GBP)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="entries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Entries</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ticketPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Price (p)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Price per ticket in pence (e.g. 500 = £5.00)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormField
            control={form.control}
            name="drawTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Draw Date & Time</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  When will the competition be drawn? Used for countdown timer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Entry Steps section removed as requested */}
        
        <FormField
          control={form.control}
          name="isVerified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md bg-slate-50">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Verified Competition</FormLabel>
                <FormDescription>
                  Mark this competition as verified (displays a verified badge)
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-700 hover:bg-blue-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Competition'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}