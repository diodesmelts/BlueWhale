import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EntryStep } from "@shared/types";

interface EntryProgressProps {
  steps: EntryStep[];
  progress: number[];
  onComplete: () => void;
}

export default function EntryProgress({ steps, progress, onComplete }: EntryProgressProps) {
  const completedCount = progress.filter(step => step === 1).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white p-3 rounded-lg border border-gray">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-[#153B84]">Entry Progress</h4>
        <span className={`text-sm font-medium ${completedCount === steps.length ? 'text-[#7ED957]' : 'text-[#7ED957]'}`}>
          {completedCount}/{steps.length} completed
        </span>
      </div>
      
      <Progress
        value={progressPercentage}
        className="h-2.5 mb-3 bg-gray-200"
        indicatorClassName="bg-[#7ED957]"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {progress[index] === 1 ? (
              <i className="fas fa-check-circle text-[#7ED957] mr-2"></i>
            ) : (
              <i className="far fa-circle text-gray-400 mr-2"></i>
            )}
            <span className={`text-sm ${progress[index] === 1 ? '' : 'text-gray-500'}`}>
              {step.description}
            </span>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={onComplete}
        className="w-full mt-3 bg-[#153B84] hover:bg-[#0D2456] text-white text-sm font-medium py-2 transition duration-300"
      >
        {completedCount === steps.length ? 'View Competition' : 'Complete Entry'}
      </Button>
    </div>
  );
}
