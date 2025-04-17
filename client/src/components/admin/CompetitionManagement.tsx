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

  // Query to fetch all competitions for admin management
  const { data: competitions, isLoading } = useQuery({
    queryKey: ['/api/admin/competitions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/competitions');
      if (!res.ok) throw new Error('Failed to fetch competitions');
      return res.json();
    }
  });

  // Mutation to delete a competition
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/competitions/${id}`);
      if (!res.ok) throw new Error('Failed to delete competition');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the competitions query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/competitions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
      
      toast({
        title: "Competition deleted",
        description: "The competition has been successfully deleted.",
      });
      
      // Close the alert dialog
      setIsDeleteAlertOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete competition: ${error.message}`,
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

  const handleDelete = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCompetition) {
      deleteMutation.mutate(selectedCompetition.id);
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gray-700">
        <Table className="text-gray-300">
          <TableHeader className="bg-gray-800">
            <TableRow className="border-gray-700 hover:bg-gray-900">
              <TableHead className="text-cyan-400">Title</TableHead>
              <TableHead className="text-cyan-400">Platform</TableHead>
              <TableHead className="text-cyan-400">Category</TableHead>
              <TableHead className="text-right text-cyan-400">Prize</TableHead>
              <TableHead className="text-cyan-400">Draw Date</TableHead>
              <TableHead className="text-cyan-400">Status</TableHead>
              <TableHead className="text-right text-cyan-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitions && competitions.length > 0 ? (
              competitions.map((competition: Competition) => (
                <TableRow key={competition.id} className="border-gray-700 hover:bg-gray-800">
                  <TableCell className="font-medium">{competition.title}</TableCell>
                  <TableCell>{competition.platform}</TableCell>
                  <TableCell className="capitalize">{competition.category || "Other"}</TableCell>
                  <TableCell className="text-right">£{competition.prize}</TableCell>
                  <TableCell>{formatDate(competition.drawTime || competition.endDate)}</TableCell>
                  <TableCell>
                    {new Date(competition.endDate) > new Date() ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-900 text-cyan-300 border border-cyan-700">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                        Ended
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-white hover:bg-gray-700">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-gray-300">
                        <DropdownMenuItem onClick={() => handleView(competition)} className="hover:bg-gray-800 focus:bg-gray-800">
                          <Eye className="mr-2 h-4 w-4 text-cyan-400" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(competition)} className="hover:bg-gray-800 focus:bg-gray-800">
                          <Pencil className="mr-2 h-4 w-4 text-purple-400" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(competition)}
                          className="text-red-400 hover:text-red-300 hover:bg-gray-800 focus:bg-gray-800"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableCell colSpan={7} className="text-center py-6 text-gray-400">
                  No competitions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Competition Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-xl">Competition Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              View all details for this competition.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompetition && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Title</h3>
                  <p className="mt-1 text-gray-300">{selectedCompetition.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Organizer</h3>
                  <p className="mt-1 text-gray-300">{selectedCompetition.organizer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Platform</h3>
                  <p className="mt-1 text-gray-300">{selectedCompetition.platform}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Category</h3>
                  <p className="mt-1 text-gray-300 capitalize">{selectedCompetition.category || "Other"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Prize</h3>
                  <p className="mt-1 text-gray-300">£{selectedCompetition.prize}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Entries</h3>
                  <p className="mt-1 text-gray-300">{selectedCompetition.entries}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Eligibility</h3>
                  <p className="mt-1 text-gray-300">{selectedCompetition.eligibility}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">End Date</h3>
                  <p className="mt-1 text-gray-300">{formatDate(selectedCompetition.endDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Draw Time</h3>
                  <p className="mt-1 text-gray-300">
                    {selectedCompetition.drawTime 
                      ? new Date(selectedCompetition.drawTime).toLocaleString() 
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Verified</h3>
                  <p className="mt-1 text-gray-300">{selectedCompetition.isVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-400">Ticket Price</h3>
                  <p className="mt-1 text-gray-300">{selectedCompetition.ticketPrice ? `£${(selectedCompetition.ticketPrice/100).toFixed(2)}` : "Free"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-cyan-400">Description</h3>
                <p className="mt-1 text-gray-300">{selectedCompetition.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-cyan-400">Image</h3>
                <div className="mt-1 rounded-md overflow-hidden w-full h-40 bg-gray-800 border border-gray-700">
                  <img 
                    src={selectedCompetition.image} 
                    alt={selectedCompetition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-cyan-400">Entry Steps</h3>
                <ul className="mt-2 space-y-2">
                  {selectedCompetition.entrySteps && selectedCompetition.entrySteps.length > 0 ? (
                    selectedCompetition.entrySteps.map((step) => (
                      <li key={step.id} className="p-3 bg-gray-800 rounded-md border border-gray-700">
                        <div className="font-medium text-purple-400">Step {step.id}</div>
                        <div className="text-gray-300">{step.description}</div>
                        {step.link && (
                          <a 
                            href={step.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm mt-1 block"
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
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
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
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Competition Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-xl">Edit Competition</DialogTitle>
            <DialogDescription className="text-gray-400">
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

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-gray-900 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-cyan-400">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This action cannot be undone. This will permanently delete the competition
              "<span className="text-purple-400 font-medium">{selectedCompetition?.title}</span>" and remove all associated entries and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 border-0"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Deleting...
                </>
              ) : (
                "Delete Competition"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}