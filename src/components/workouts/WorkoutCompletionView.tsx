
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface WorkoutCompletionViewProps {
  timeElapsed: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  onComplete: () => void;
}

const WorkoutCompletionView: React.FC<WorkoutCompletionViewProps> = ({
  timeElapsed,
  caloriesBurned,
  exercisesCompleted,
  onComplete
}) => {
  const minutes = Math.round(timeElapsed / 60);
  
  return (
    <div className="text-center py-12">
      <div className="bg-green-100 text-green-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-bold mb-4">Workout Complete!</h3>
      <p className="text-gray-600 mb-6">Great job on finishing your workout!</p>
      <div className="flex items-center justify-center space-x-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-800">{minutes}</div>
          <div className="text-sm text-gray-500">Minutes</div>
        </div>
        <div className="h-10 border-r border-gray-200"></div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-500">
            ~{caloriesBurned}
          </div>
          <div className="text-sm text-gray-500">Calories</div>
        </div>
        <div className="h-10 border-r border-gray-200"></div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{exercisesCompleted}</div>
          <div className="text-sm text-gray-500">Exercises</div>
        </div>
      </div>
      
      <div className="mt-8">
        <Button onClick={onComplete} className="bg-purple-600 hover:bg-purple-700">
          <Check className="mr-2 h-4 w-4" />
          Complete Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutCompletionView;
