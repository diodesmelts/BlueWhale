import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Shield, Trophy, Users, List, FileUp, UploadCloud } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import UserManagement from "@/components/admin/UserManagement";
import CompetitionManagement from "@/components/admin/CompetitionManagement";
import AdminSettings from "@/components/admin/AdminSettings";

const competitionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  organizer: z.string().min(2, "Organizer must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().min(1, "Image is required"),
  // Platform is now optional with a default value
  platform: z.string().default("Other"),
  category: z.string().default("other"), // Category field for family, appliances, cash, other
  prize: z.coerce.number().min(1, "Prize must be at least £1"),
  entries: z.coerce.number().default(0),
  drawTime: z.coerce.date().refine(date => date > new Date(), "Draw date must be in the future"),
  // Entry steps are now optional with an empty default array
  entrySteps: z.array(
    z.object({
      id: z.number(),
      description: z.string().min(3, "Step description is required"),
      link: z.string().optional(),
    })
  ).default([]),
  isVerified: z.boolean().default(false),
  ticketPrice: z.coerce.number().default(0), // Ticket price
  maxTicketsPerUser: z.coerce.number().default(10), // Max tickets per user
  totalTickets: z.coerce.number().default(1000), // Total tickets
  soldTickets: z.coerce.number().default(0), // Sold tickets
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

export default function AdminPage() {
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { isAdmin, isLoading: adminLoading, error } = useAdmin();

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      setLocation("/");
    }
  }, [isAdmin, adminLoading, setLocation]);
  
  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Update the image file state
      setImageFile(file);
      
      // Update the form field with a temporary value
      form.setValue("image", file.name);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: "",
      organizer: "",
      description: "",
      image: "",
      platform: "Other", // Default, but hidden from UI
      category: "other", // Default category
      prize: 0,
      entries: 0,
      drawTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      entrySteps: [], // Empty array as we're removing this field
      isVerified: false,
      ticketPrice: 0,
      maxTicketsPerUser: 10,
      totalTickets: 1000,
      soldTickets: 0
    }
  });

  const onSubmit = async (data: CompetitionFormValues) => {
    setFormLoading(true);
    
    try {
      // If we have an image file, we need to upload it first
      let imageUrl = data.image;
      
      if (imageFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // Upload the image file
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include', // Include credentials for admin authorization
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url; // Get the URL from the response
      }
      
      // Format the date as ISO string and include the image URL
      // Also add required fields that are no longer in the form
      const formattedData = {
        ...data,
        image: imageUrl,
        drawTime: data.drawTime.toISOString(),
        type: "competition", // Default value for required type field
        eligibility: "worldwide", // Default value for required eligibility field
        endDate: data.drawTime.toISOString(), // Use drawTime as endDate to satisfy database constraints
      };

      const response = await apiRequest("POST", "/api/admin/competitions", formattedData);
      
      if (response.ok) {
        toast({
          title: "Competition created successfully",
          description: "Your new competition has been added to the platform.",
          variant: "default",
        });
        
        // Reset form
        form.reset();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create competition");
      }
    } catch (error) {
      console.error("Error creating competition:", error);
      toast({
        title: "Error creating competition",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Show loading state while checking admin status
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-8 w-8 text-cyan-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-transparent bg-clip-text">Admin Dashboard</h1>
      </div>
      
      <Card className="bg-gray-900 shadow-lg border-cyan-800 mb-8 text-white">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle className="text-2xl flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-cyan-400" />
            Create New Competition
          </CardTitle>
          <CardDescription className="text-gray-400">
            Add a new competition to the platform. All fields are required unless specified.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
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
                      {/* Hidden input field for the form handling */}
                      <Input 
                        type="hidden" 
                        {...field} 
                      />
                      
                      {/* Custom file upload UI */}
                      <div 
                        className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <div className="space-y-3 text-center">
                            <img 
                              src={imagePreview} 
                              alt="Competition Preview" 
                              className="mx-auto max-h-[200px] rounded-md object-contain"
                            />
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-sm"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImagePreview(null);
                                setImageFile(null);
                                field.onChange("");
                              }}
                            >
                              Remove Image
                            </Button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                            <p className="text-sm font-medium mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                              PNG, JPG, or JPEG (max. 5MB, 700x700px recommended)
                            </p>
                          </>
                        )}
                        
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <p className="text-xs text-slate-500 font-medium">OR</p>
                        <div className="flex-1 h-px bg-slate-200"></div>
                      </div>
                      
                      <Input
                        type="text"
                        placeholder="Enter an image URL instead (e.g. https://example.com/image.jpg)"
                        value={!imageFile ? field.value : ''}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          // Clear file upload if URL is entered
                          if (e.target.value) {
                            setImagePreview(null);
                            setImageFile(null);
                          }
                        }}
                      />
                    </div>
                    <FormDescription>
                      Upload an image or enter a URL for the competition (700x700px recommended)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="appliances">Appliances</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Competition category determines which section it appears in
                      </FormDescription>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="drawTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Draw Date & Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value instanceof Date ? field.value.toISOString().substring(0, 16) : ''}
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="totalTickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Tickets</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of tickets available for this competition
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxTicketsPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Tickets Per User</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of tickets a user can purchase
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="soldTickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sold Tickets</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of tickets already sold (usually starts at 0)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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

              <CardFooter className="border-t border-gray-800 pt-6 pb-0 flex justify-end px-0">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Competition'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Competition Management Section */}
      <div className="mt-8 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <List className="h-6 w-6 text-cyan-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-transparent bg-clip-text">Competition Management</h2>
        </div>
        <Card className="bg-gray-900 shadow-lg border-cyan-800 text-white">
          <CardHeader className="border-b border-gray-800 pb-3">
            <CardTitle className="text-xl text-cyan-400">
              Manage Existing Competitions
            </CardTitle>
            <CardDescription className="text-gray-400">
              View, edit, or delete competitions from the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CompetitionManagement />
          </CardContent>
        </Card>
      </div>
      
      {/* User Management Section */}
      <div className="mt-8 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-6 w-6 text-cyan-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-transparent bg-clip-text">User Management</h2>
        </div>
        <UserManagement />
      </div>

      {/* Site Settings Section */}
      <div className="mt-8 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <i className="fas fa-cog h-6 w-6 text-cyan-500 flex items-center justify-center"></i>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-transparent bg-clip-text">Site Settings</h2>
        </div>
        <AdminSettings />
      </div>
    </div>
  );
}