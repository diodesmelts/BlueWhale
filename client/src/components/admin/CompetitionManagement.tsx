import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pencil, Trash2, Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { Competition } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompetitionEditForm } from "./CompetitionEditForm";

export default function CompetitionManagement() {
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  // Query to fetch all competitions for admin management
  const { data: competitions, isLoading } = useQuery({
    queryKey: ['/api/admin/competitions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/competitions');
      if (!res.ok) throw new Error('Failed to fetch competitions');
      return res.json();
    }
  });

  // Mutation to delist a competition (soft delete)
  const delistMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/competitions/${id}`);
      if (!res.ok) throw new Error('Failed to delist competition');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the competitions query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/competitions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
      
      toast({
        title: "Competition delisted",
        description: "The competition has been moved to past competitions.",
      });
      
      // Close the alert dialog
      setIsDeleteAlertOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delist competition: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleView = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsViewModalOpen(true);
  };

  const handleDelist = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelist = () => {
    if (selectedCompetition) {
      delistMutation.mutate(selectedCompetition.id);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Filter active and delisted competitions
  const activeCompetitions = competitions?.filter((comp: Competition) => !comp.isDeleted) || [];
  const pastCompetitions = competitions?.filter((comp: Competition) => comp.isDeleted) || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Existing Competitions</h2>
      <Tabs defaultValue="active" className="w-full" onValueChange={(value) => setActiveTab(value as 'active' | 'past')}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="active" className="text-sm">Active Competitions</TabsTrigger>
          <TabsTrigger value="past" className="text-sm">Past Competitions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0">
          <div className="rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <Table className="text-gray-700">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-gray-200 hover:bg-gray-100">
                  <TableHead className="text-gray-700 font-semibold">Title</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Platform</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Category</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">Prize</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Draw Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCompetitions.length > 0 ? (
                  activeCompetitions.map((competition: Competition) => (
                    <TableRow key={competition.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-medium">{competition.title}</TableCell>
                      <TableCell>{competition.platform}</TableCell>
                      <TableCell className="capitalize">{competition.category || "Other"}</TableCell>
                      <TableCell className="text-right font-medium">£{competition.prize}</TableCell>
                      <TableCell>{formatDate(competition.drawTime || competition.endDate)}</TableCell>
                      <TableCell>
                        {new Date(competition.endDate) > new Date() ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            Ended
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-700 shadow-md">
                            <DropdownMenuItem onClick={() => handleView(competition)} className="hover:bg-gray-50 focus:bg-gray-50">
                              <Eye className="mr-2 h-4 w-4 text-cyan-600" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(competition)} className="hover:bg-gray-50 focus:bg-gray-50">
                              <Pencil className="mr-2 h-4 w-4 text-purple-600" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelist(competition)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No active competitions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <Table className="text-gray-700">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-gray-200 hover:bg-gray-100">
                  <TableHead className="text-gray-700 font-semibold">Title</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Platform</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Category</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">Prize</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Draw Date</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastCompetitions.length > 0 ? (
                  pastCompetitions.map((competition: Competition) => (
                    <TableRow key={competition.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-medium">{competition.title}</TableCell>
                      <TableCell>{competition.platform}</TableCell>
                      <TableCell className="capitalize">{competition.category || "Other"}</TableCell>
                      <TableCell className="text-right font-medium">£{competition.prize}</TableCell>
                      <TableCell>{formatDate(competition.drawTime || competition.endDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-700 shadow-md">
                            <DropdownMenuItem onClick={() => handleView(competition)} className="hover:bg-gray-50 focus:bg-gray-50">
                              <Eye className="mr-2 h-4 w-4 text-cyan-600" />
                              View
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No past competitions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Competition Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-800 border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-xl font-semibold">Competition Details</DialogTitle>
            <DialogDescription className="text-gray-500">
              View all details for this competition.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompetition && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Title</h3>
                  <p className="mt-1 text-gray-600">{selectedCompetition.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Organizer</h3>
                  <p className="mt-1 text-gray-600">{selectedCompetition.organizer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Platform</h3>
                  <p className="mt-1 text-gray-600">{selectedCompetition.platform}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Category</h3>
                  <p className="mt-1 text-gray-600 capitalize">{selectedCompetition.category || "Other"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Prize</h3>
                  <p className="mt-1 text-gray-600 font-semibold">£{selectedCompetition.prize}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Entries</h3>
                  <p className="mt-1 text-gray-600">{selectedCompetition.entries}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Eligibility</h3>
                  <p className="mt-1 text-gray-600">{selectedCompetition.eligibility}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">End Date</h3>
                  <p className="mt-1 text-gray-600">{formatDate(selectedCompetition.endDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Draw Time</h3>
                  <p className="mt-1 text-gray-600">
                    {selectedCompetition.drawTime 
                      ? new Date(selectedCompetition.drawTime).toLocaleString() 
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Verified</h3>
                  <p className="mt-1 text-gray-600">
                    {selectedCompetition.isVerified ? 
                      <span className="text-cyan-600 font-medium">Yes</span> : 
                      <span className="text-gray-500">No</span>
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Ticket Price</h3>
                  <p className="mt-1 text-gray-600 font-semibold">{selectedCompetition.ticketPrice ? `£${(selectedCompetition.ticketPrice/100).toFixed(2)}` : "Free"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">{selectedCompetition.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">Image</h3>
                <div className="mt-1 rounded-md overflow-hidden w-full h-40 bg-white border border-gray-200 shadow-sm">
                  <img 
                    src={selectedCompetition.image} 
                    alt={selectedCompetition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">Entry Steps</h3>
                <ul className="mt-2 space-y-2">
                  {selectedCompetition.entrySteps && selectedCompetition.entrySteps.length > 0 ? (
                    selectedCompetition.entrySteps.map((step) => (
                      <li key={step.id} className="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                        <div className="font-medium text-cyan-600">Step {step.id}</div>
                        <div className="text-gray-600">{step.description}</div>
                        {step.link && (
                          <a 
                            href={step.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:text-blue-600 text-sm mt-1 block"
                          >
                            {step.link}
                          </a>
                        )}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No entry steps defined</p>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewModalOpen(false);
                if (selectedCompetition) {
                  handleEdit(selectedCompetition);
                }
              }}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-sm"
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Competition Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-800 border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-xl font-semibold">Edit Competition</DialogTitle>
            <DialogDescription className="text-gray-500">
              Make changes to the competition details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompetition && (
            <CompetitionEditForm 
              competition={selectedCompetition} 
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delist Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-white text-gray-800 border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-800 font-semibold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will delist the competition "<span className="text-cyan-600 font-medium">{selectedCompetition?.title}</span>" and 
              move it to the Past Competitions section. It will no longer appear in the active competitions list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600 border-0 text-white shadow-sm"
              onClick={confirmDelist}
              disabled={delistMutation.isPending}
            >
              {delistMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Delisting...
                </>
              ) : (
                "Delist Competition"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}