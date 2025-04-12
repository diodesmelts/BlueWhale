import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Shield, Trophy } from "lucide-react";
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

const competitionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  organizer: z.string().min(2, "Organizer must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Must be a valid URL"),
  platform: z.string().min(1, "Platform is required"),
  type: z.string().min(1, "Type is required"),
  prize: z.coerce.number().min(1, "Prize must be at least $1"),
  entries: z.coerce.number().default(0),
  eligibility: z.string().min(1, "Eligibility is required"),
  endDate: z.coerce.date().refine(date => date > new Date(), "End date must be in the future"),
  entrySteps: z.array(
    z.object({
      id: z.number(),
      description: z.string().min(3, "Step description is required"),
      link: z.string().optional(),
    })
  ).min(1, "At least one entry step is required"),
  isVerified: z.boolean().default(false),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [entrySteps, setEntrySteps] = useState([
    { id: 1, description: "", link: "" }
  ]);
  const navigate = useNavigate();

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: "",
      organizer: "",
      description: "",
      image: "",
      platform: "Instagram",
      type: "Giveaway",
      prize: 0,
      entries: 0,
      eligibility: "Worldwide",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      entrySteps: entrySteps,
      isVerified: false
    }
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/check");
        if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const addEntryStep = () => {
    const newStep = {
      id: entrySteps.length + 1,
      description: "",
      link: ""
    };
    
    setEntrySteps([...entrySteps, newStep]);
    
    // Update the form value with the new steps
    const currentSteps = form.getValues("entrySteps") || [];
    form.setValue("entrySteps", [...currentSteps, newStep]);
  };

  const onSubmit = async (data: CompetitionFormValues) => {
    setIsLoading(true);
    
    try {
      // Format the date as ISO string
      const formattedData = {
        ...data,
        endDate: data.endDate.toISOString(),
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
        setEntrySteps([{ id: 1, description: "", link: "" }]);
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
      setIsLoading(false);
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
        <Shield className="h-8 w-8 text-blue-700" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <Card className="bg-white shadow-lg border-blue-100 mb-8">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-2xl flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-blue-600" />
            Create New Competition
          </CardTitle>
          <CardDescription>
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
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL to an image that represents this competition
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Giveaway">Giveaway</SelectItem>
                          <SelectItem value="Sweepstakes">Sweepstakes</SelectItem>
                          <SelectItem value="Contest">Contest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="eligibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligibility</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select eligibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Worldwide">Worldwide</SelectItem>
                          <SelectItem value="US Only">US Only</SelectItem>
                          <SelectItem value="US & Canada">US & Canada</SelectItem>
                          <SelectItem value="Europe">Europe</SelectItem>
                          <SelectItem value="Asia">Asia</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <FormLabel>Prize Value (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Entry Steps</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addEntryStep}
                    className="text-blue-600 border-blue-200"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Step
                  </Button>
                </div>
                
                {entrySteps.map((step, index) => (
                  <div key={step.id} className="mb-4 p-4 border rounded-md bg-slate-50">
                    <h4 className="font-medium mb-3">Step {index + 1}</h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`entrySteps.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Follow our Instagram account" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`entrySteps.${index}.link`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/username" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <input 
                        type="hidden" 
                        {...form.register(`entrySteps.${index}.id`)} 
                        value={step.id} 
                      />
                    </div>
                  </div>
                ))}
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

              <CardFooter className="border-t pt-6 pb-0 flex justify-end px-0">
                <Button 
                  type="submit" 
                  className="bg-blue-700 hover:bg-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
    </div>
  );
}