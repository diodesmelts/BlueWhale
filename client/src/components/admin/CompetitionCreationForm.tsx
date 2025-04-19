import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Upload, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form validation schema
const competitionSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  organizer: z.string().min(2, { message: "Organizer must be at least 2 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  image: z.string().min(1, { message: "Image is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  prize: z.coerce.number().min(1, { message: "Prize value must be at least 1" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  drawTime: z.string().min(1, { message: "Draw time is required" }),
  entrySteps: z.array(
    z.object({
      description: z.string().min(1, { message: "Step description is required" }),
      link: z.string().optional(),
    })
  ).min(1, { message: "At least one entry step is required" }),
  ticketPrice: z.coerce.number().min(100, { message: "Ticket price must be at least 100 cents (£1)" }),
  maxTicketsPerUser: z.coerce.number().min(1, { message: "Max tickets per user must be at least 1" }),
  totalTickets: z.coerce.number().min(10, { message: "Total tickets must be at least 10" }),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

export default function CompetitionCreationForm() {
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Initialize the entry steps array with one empty step
  const defaultEntrySteps = [{ description: "", link: "" }];
  
  // Set up the form with default values
  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: "",
      organizer: "Blue Whale Competitions",
      description: "",
      image: "",
      category: "Other",
      prize: 0,
      endDate: "",
      drawTime: "",
      entrySteps: defaultEntrySteps,
      ticketPrice: 100, // £1 in pence
      maxTicketsPerUser: 10,
      totalTickets: 1000,
    },
  });
  
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
  
  // Add a new entry step
  const addEntryStep = () => {
    const currentSteps = form.getValues("entrySteps") || [];
    form.setValue("entrySteps", [...currentSteps, { description: "", link: "" }]);
  };
  
  // Remove an entry step
  const removeEntryStep = (index: number) => {
    const currentSteps = form.getValues("entrySteps") || [];
    if (currentSteps.length > 1) {
      form.setValue(
        "entrySteps",
        currentSteps.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Cannot remove step",
        description: "At least one entry step is required",
        variant: "destructive",
      });
    }
  };
  
  // Form submission handler
  const onSubmit = async (data: CompetitionFormValues) => {
    setFormLoading(true);
    
    try {
      // Prepare form data for image upload if needed
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        
        // Upload the image
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        
        const uploadResult = await uploadResponse.json();
        // Use the returned image URL
        data.image = uploadResult.url;
      }
      
      // Convert dates to ISO strings
      const formattedData = {
        ...data,
        // Ensure these are properly formatted dates
        endDate: new Date(data.endDate).toISOString(),
        drawTime: new Date(data.drawTime).toISOString(),
        // Initialize sold tickets to 0
        soldTickets: 0,
      };
      
      // Send the form data to create a new competition
      const response = await apiRequest("POST", "/api/admin/competitions", formattedData);
      
      if (response.ok) {
        toast({
          title: "Competition created successfully",
          description: "Your new competition has been added to the platform.",
          variant: "default",
        });
        
        // Reset form
        form.reset();
        setImagePreview(null);
        setImageFile(null);
        
        // Invalidate competitions queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/admin/competitions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Competition Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Ultimate Gaming Setup Giveaway" 
                    {...field} 
                    className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </FormControl>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="organizer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Organizer</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Blue Whale Competitions" 
                    {...field} 
                    className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </FormControl>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the competition and what the winner will receive" 
                  className="min-h-[120px] bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Competition Image</FormLabel>
              <div className="space-y-4">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-md border border-gray-200">
                    <TabsTrigger value="upload" className="data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </TabsTrigger>
                    <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm">
                      <span className="i-lucide-link h-4 w-4 mr-2"></span>
                      Image URL
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="pt-4">
                    <div className="grid gap-4">
                      <div className="grid w-full items-center gap-1.5">
                        <div 
                          className="w-full h-48 border-2 border-dashed rounded-lg border-gray-300 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={imagePreview} 
                                className="w-full h-full object-cover rounded-lg" 
                                alt="Competition preview" 
                              />
                              <button
                                type="button"
                                className="absolute top-2 right-2 bg-gray-800/80 text-white p-1 rounded-full hover:bg-gray-900"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImagePreview(null);
                                  setImageFile(null);
                                  form.setValue("image", "");
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/png, image/jpeg, image/jpg, image/gif"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="url" className="pt-4">
                    <div className="grid gap-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                          onChange={(e) => {
                            const url = e.target.value;
                            form.setValue("image", url);
                            if (url) {
                              setImagePreview(url);
                            } else {
                              setImagePreview(null);
                            }
                          }}
                        />
                        {imagePreview && (
                          <div className="w-full h-48 rounded-lg overflow-hidden mt-2 border border-gray-200">
                            <img 
                              src={imagePreview} 
                              className="w-full h-full object-cover" 
                              alt="Competition preview" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <FormMessage className="text-rose-500" />
              </div>
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="cars">Cars</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="prize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Prize Value (£)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="e.g. 1000" 
                    {...field} 
                    className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </FormControl>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">End Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="date" 
                      {...field} 
                      className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <Calendar className="absolute top-[10px] right-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  When the competition will stop accepting entries
                </FormDescription>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="drawTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Draw Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  When the competition will be drawn
                </FormDescription>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="ticketPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Ticket Price (pence)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="100" 
                    step="1" 
                    placeholder="e.g. 100" 
                    {...field} 
                    className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Minimum £1 (100p)
                </FormDescription>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxTicketsPerUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Max Tickets Per User</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    step="1" 
                    placeholder="e.g. 10" 
                    {...field} 
                    className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Maximum tickets a user can purchase
                </FormDescription>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="totalTickets"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Total Tickets</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="10" 
                    step="1" 
                    placeholder="e.g. 1000" 
                    {...field} 
                    className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Total tickets available for this competition
                </FormDescription>
                <FormMessage className="text-rose-500" />
              </FormItem>
            )}
          />
        </div>
        

        
        <div>
          <Label className="text-gray-700 font-medium">Entry Steps</Label>
          <p className="text-xs text-gray-500 mb-2">
            Add steps that users need to follow to enter the competition
          </p>
          
          <Card className="bg-gray-50 border border-gray-200 shadow-sm">
            <div className="p-4 space-y-4">
              {form.watch("entrySteps")?.map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`entrySteps.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder={`Step ${index + 1}: e.g. Follow us on Instagram`} 
                              {...field} 
                              className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`entrySteps.${index}.link`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Optional link: e.g. https://instagram.com/account" 
                              {...field} 
                              className="bg-white border border-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeEntryStep(index)}
                    className="mt-1 bg-white hover:bg-gray-100 border border-gray-200"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addEntryStep}
                className="w-full mt-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </Card>
        </div>
        
        <Button 
          type="submit" 
          disabled={formLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
        >
          {formLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Competition...
            </>
          ) : (
            "Create Competition"
          )}
        </Button>
      </form>
    </Form>
  );
}