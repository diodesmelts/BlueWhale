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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Prize</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitions && competitions.length > 0 ? (
              competitions.map((competition: Competition) => (
                <TableRow key={competition.id}>
                  <TableCell className="font-medium">{competition.title}</TableCell>
                  <TableCell>{competition.platform}</TableCell>
                  <TableCell>{competition.type}</TableCell>
                  <TableCell className="text-right">${competition.prize}</TableCell>
                  <TableCell>{formatDate(competition.endDate)}</TableCell>
                  <TableCell>
                    {new Date(competition.endDate) > new Date() ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Ended
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(competition)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(competition)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(competition)}
                          className="text-red-600 focus:text-red-700"
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
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No competitions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Competition Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Competition Details</DialogTitle>
            <DialogDescription>
              View all details for this competition.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompetition && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p className="mt-1">{selectedCompetition.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Organizer</h3>
                  <p className="mt-1">{selectedCompetition.organizer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Platform</h3>
                  <p className="mt-1">{selectedCompetition.platform}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="mt-1">{selectedCompetition.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Prize</h3>
                  <p className="mt-1">${selectedCompetition.prize}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entries</h3>
                  <p className="mt-1">{selectedCompetition.entries}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Eligibility</h3>
                  <p className="mt-1">{selectedCompetition.eligibility}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="mt-1">{formatDate(selectedCompetition.endDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Draw Time</h3>
                  <p className="mt-1">
                    {selectedCompetition.drawTime 
                      ? new Date(selectedCompetition.drawTime).toLocaleString() 
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Verified</h3>
                  <p className="mt-1">{selectedCompetition.isVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entry Fee</h3>
                  <p className="mt-1">{selectedCompetition.entryFee ? `$${selectedCompetition.entryFee}` : "Free"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{selectedCompetition.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Image</h3>
                <div className="mt-1 rounded-md overflow-hidden w-full h-40 bg-gray-100">
                  <img 
                    src={selectedCompetition.image} 
                    alt={selectedCompetition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Entry Steps</h3>
                <ul className="mt-2 space-y-2">
                  {selectedCompetition.entrySteps.map((step) => (
                    <li key={step.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">Step {step.id}</div>
                      <div>{step.description}</div>
                      {step.link && (
                        <a 
                          href={step.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-1 block"
                        >
                          {step.link}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
            <Button onClick={() => {
              setIsViewModalOpen(false);
              if (selectedCompetition) {
                handleEdit(selectedCompetition);
              }
            }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Competition Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Competition</DialogTitle>
            <DialogDescription>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the competition
              "{selectedCompetition?.title}" and remove all associated entries and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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