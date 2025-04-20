import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define mascot data
export const mascots = [
  { id: "whale", name: "Blue Whale", emoji: "🐋", color: "bg-blue-500" },
  { id: "dolphin", name: "Dolphin", emoji: "🐬", color: "bg-cyan-500" },
  { id: "shark", name: "Shark", emoji: "🦈", color: "bg-gray-500" },
  { id: "octopus", name: "Octopus", emoji: "🐙", color: "bg-purple-500" },
  { id: "fish", name: "Tropical Fish", emoji: "🐠", color: "bg-amber-500" },
  { id: "turtle", name: "Turtle", emoji: "🐢", color: "bg-green-500" },
  { id: "crab", name: "Crab", emoji: "🦀", color: "bg-red-500" },
  { id: "lobster", name: "Lobster", emoji: "🦞", color: "bg-orange-500" },
  { id: "squid", name: "Squid", emoji: "🦑", color: "bg-pink-500" },
  { id: "seal", name: "Seal", emoji: "🦭", color: "bg-gray-400" },
  { id: "penguin", name: "Penguin", emoji: "🐧", color: "bg-gray-800" },
  { id: "polar-bear", name: "Polar Bear", emoji: "🐻‍❄️", color: "bg-white" },
];

export function getMascotById(id: string | null) {
  if (!id) return mascots[0]; // Default to whale
  return mascots.find((m) => m.id === id) || mascots[0];
}

interface MascotSelectorProps {
  currentMascotId: string | null;
  onSelect: (mascotId: string) => void;
  className?: string;
}

export default function MascotSelector({ currentMascotId, onSelect, className = "" }: MascotSelectorProps) {
  const [selectedMascotId, setSelectedMascotId] = useState(currentMascotId || "whale");
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const currentMascot = getMascotById(currentMascotId);

  // For profile page, sometimes we just want to display the grid without the dialog
  if (className === "col-span-4") {
    return (
      <div className="grid grid-cols-4 gap-3 py-2">
        {mascots.map((mascot) => (
          <div 
            key={mascot.id} 
            className={`
              aspect-square rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all
              ${mascot.id === currentMascotId ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black scale-105' : 'hover:bg-gray-800'}
            `}
            onClick={() => onSelect(mascot.id)}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mascot.color} mb-1`}>
              <span className="text-2xl">{mascot.emoji}</span>
            </div>
            <span className="text-xs text-center mt-1 text-gray-300">{mascot.name}</span>
          </div>
        ))}
      </div>
    );
  }

  const updateMascotMutation = useMutation({
    mutationFn: async (mascotId: string) => {
      const res = await apiRequest("PATCH", "/api/user/profile", { mascotId });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update mascot");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Mascot updated",
        description: "Your profile mascot has been updated successfully.",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update mascot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectMascot = (mascotId: string) => {
    setSelectedMascotId(mascotId);
  };

  const handleSaveMascot = () => {
    updateMascotMutation.mutate(selectedMascotId);
    onSelect(selectedMascotId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={`cursor-pointer ${className}`}>
          {currentMascot && (
            <div 
              className={`flex items-center justify-center rounded-full transition-all ${currentMascot.color} hover:scale-105 hover:shadow-md`}
              style={{ width: "100%", height: "100%" }}
            >
              <span className="text-2xl">{currentMascot.emoji}</span>
            </div>
          )}
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-6 bg-black border border-gray-800 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold text-cyan-400 mb-2">
            Choose Your Mascot
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 py-4">
          {mascots.map((mascot) => (
            <div 
              key={mascot.id} 
              className={`
                aspect-square rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all
                ${mascot.id === selectedMascotId ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black scale-105' : 'hover:bg-gray-800'}
              `}
              onClick={() => handleSelectMascot(mascot.id)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mascot.color} mb-1`}>
                <span className="text-2xl">{mascot.emoji}</span>
              </div>
              <span className="text-xs text-center mt-1 text-gray-300">{mascot.name}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveMascot}
            disabled={updateMascotMutation.isPending}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          >
            {updateMascotMutation.isPending ? "Saving..." : "Save Choice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}