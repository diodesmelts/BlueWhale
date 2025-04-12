import { Button } from "@/components/ui/button";
import { EntryStep } from "@shared/schema";

interface EntryProgressProps {
  steps: EntryStep[];
  progress: number[];
  onComplete: () => void;
}

export default function EntryProgress({ steps, progress, onComplete }: EntryProgressProps) {
  const completedCount = progress.filter(step => step === 1).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-rose-600">Entry Progress</h4>
        <span className={`text-sm font-medium ${completedCount === steps.length ? 'text-emerald-500' : 'text-amber-500'}`}>
          {completedCount}/{steps.length} completed
        </span>
      </div>
      
      {/* Custom progress bar to avoid the warning */}
      <div className="h-2.5 w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {progress[index] === 1 ? (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white mr-2">
                <i className="fas fa-check text-xs"></i>
              </div>
            ) : (
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 mr-2"></div>
            )}
            <span className={`text-sm ${progress[index] === 1 ? 'font-medium' : 'text-gray-500'}`}>
              {step.description}
            </span>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={onComplete}
        className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-medium py-2 transition duration-300"
      >
        {completedCount === steps.length ? 'View Competition' : 'Complete Entry'}
      </Button>
    </div>
  );
}
