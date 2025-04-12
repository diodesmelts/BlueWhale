import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Shield, Trophy, Users, List } from "lucide-react";
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

const competitionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  organizer: z.string().min(2, "Organizer must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Must be a valid URL"),
  // Platform is now optional with a default value
  platform: z.string().default("Other"),
  type: z.string().min(1, "Type is required"),
  prize: z.coerce.number().min(1, "Prize must be at least $1"),
  entries: z.coerce.number().default(0),
  eligibility: z.string().min(1, "Eligibility is required"),
  endDate: z.coerce.date().refine(date => date > new Date(), "End date must be in the future"),
  // Entry steps are now optional with an empty default array
  entrySteps: z.array(
    z.object({
      id: z.number(),
      description: z.string().min(3, "Step description is required"),
      link: z.string().optional(),
    })
  ).default([]),
  isVerified: z.boolean().default(false),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

export default function AdminPage() {
  const [formLoading, setFormLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { isAdmin, isLoading: adminLoading, error } = useAdmin();

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      setLocation("/");
    }
  }, [isAdmin, adminLoading, setLocation]);

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: "",
      organizer: "",
      description: "",
      image: "",
      platform: "Other", // Default, but hidden from UI
      type: "Giveaway",
      prize: 0,
      entries: 0,
      eligibility: "Worldwide",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      entrySteps: [], // Empty array as we're removing this field
      isVerified: false
    }
  });

  const onSubmit = async (data: CompetitionFormValues) => {
    setFormLoading(true);
    
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <CardFooter className="border-t pt-6 pb-0 flex justify-end px-0">
                <Button 
                  type="submit" 
                  className="bg-blue-700 hover:bg-blue-800"
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
          <List className="h-6 w-6 text-blue-700" />
          <h2 className="text-2xl font-bold">Competition Management</h2>
        </div>
        <Card className="bg-white shadow-lg border-blue-100">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-xl">
              Manage Existing Competitions
            </CardTitle>
            <CardDescription>
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
          <Users className="h-6 w-6 text-blue-700" />
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>
        <UserManagement />
      </div>
    </div>
  );
}