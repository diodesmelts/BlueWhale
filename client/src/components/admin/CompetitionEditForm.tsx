import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Competition } from "@shared/schema";
import { Loader2, Plus, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const competitionUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  organizer: z.string().min(2, "Organizer must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Must be a valid URL"),
  platform: z.string().min(1, "Platform is required"),
  type: z.string().min(1, "Type is required"),
  prize: z.coerce.number().min(1, "Prize must be at least $1"),
  entries: z.coerce.number().default(0),
  eligibility: z.string().min(1, "Eligibility is required"),
  endDate: z.coerce.date(),
  entrySteps: z.array(
    z.object({
      id: z.number(),
      description: z.string().min(3, "Step description is required"),
      link: z.string().optional(),
    })
  ).min(1, "At least one entry step is required"),
  isVerified: z.boolean().default(false),
  entryFee: z.coerce.number().nullable().default(null),
});

type CompetitionUpdateFormValues = z.infer<typeof competitionUpdateSchema>;

interface CompetitionEditFormProps {
  competition: Competition;
  onClose: () => void;
}

export function CompetitionEditForm({ competition, onClose }: CompetitionEditFormProps) {
  const [entrySteps, setEntrySteps] = useState(competition.entrySteps || []);
  const [loading, setLoading] = useState(false);

  // Set up the form with existing competition values
  const form = useForm<CompetitionUpdateFormValues>({
    resolver: zodResolver(competitionUpdateSchema),
    defaultValues: {
      title: competition.title,
      organizer: competition.organizer,
      description: competition.description,
      image: competition.image,
      platform: competition.platform,
      type: competition.type,
      prize: competition.prize,
      entries: competition.entries || 0,
      eligibility: competition.eligibility,
      endDate: new Date(competition.endDate),
      entrySteps: competition.entrySteps || [],
      isVerified: competition.isVerified || false,
      entryFee: competition.entryFee || null,
    }
  });

  // Update form mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CompetitionUpdateFormValues) => {
      const res = await apiRequest('PUT', `/api/admin/competitions/${competition.id}`, {
        ...data,
        endDate: data.endDate.toISOString(),
      });
      
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

  // Function to add a new entry step
  const addEntryStep = () => {
    const newStep = {
      id: Math.max(0, ...entrySteps.map(s => s.id)) + 1,
      description: "",
      link: "",
    };
    
    setEntrySteps([...entrySteps, newStep]);
    
    // Update the form value with the new steps
    const currentSteps = form.getValues("entrySteps") || [];
    form.setValue("entrySteps", [...currentSteps, newStep]);
  };

  // Function to remove an entry step
  const removeEntryStep = (index: number) => {
    const updatedSteps = [...entrySteps];
    updatedSteps.splice(index, 1);
    setEntrySteps(updatedSteps);
    
    // Update the form value with the new steps
    form.setValue("entrySteps", updatedSteps);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            name="entryFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Fee (USD) - Optional</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="0" 
                    {...field} 
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty for free competitions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
            <div key={index} className="mb-4 p-4 border rounded-md bg-slate-50 relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => removeEntryStep(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              
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