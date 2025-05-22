
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Layers, Dumbbell } from 'lucide-react';

interface WorkoutProgressProps {
  progress: number;
  isWorkoutPack: boolean;
  isAIGeneratedPack: boolean;
  activeWorkout: any;
  currentExercise: any;
  activePackItemIndex: number;
  packItems?: any[];
  exercises: any[];
}

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  progress,
  isWorkoutPack,
  isAIGeneratedPack,
  activeWorkout,
  currentExercise,
  activePackItemIndex,
  packItems,
  exercises
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Workout Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-100" />
      </div>

      {(isWorkoutPack || isAIGeneratedPack) && currentExercise && (
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-purple-800">
            Currently on: {isAIGeneratedPack ? currentExercise.name : activeWorkout.title} ({activePackItemIndex + 1}/{isAIGeneratedPack ? exercises.length : (packItems?.length || 0)})
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkoutHeader: React.FC<{
  title: string;
  description?: string;
  isWorkoutPack?: boolean;
  isAIGeneratedPack?: boolean;
}> = ({ title, description, isWorkoutPack, isAIGeneratedPack }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {isWorkoutPack || isAIGeneratedPack ? (
          <Layers className="mr-2 h-5 w-5 text-purple-600" />
        ) : (
          <Dumbbell className="mr-2 h-5 w-5 text-purple-600" />
        )}
        {title}
      </div>
      {(isWorkoutPack || isAIGeneratedPack) && (
        <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700">
          AI Pack
        </Badge>
      )}
    </div>
  );
};

export default WorkoutProgress;
