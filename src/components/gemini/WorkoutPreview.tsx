
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Clock } from 'lucide-react';

interface WorkoutPreviewProps {
  workoutData: any[];
  onAddWorkout?: (workout: any) => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workoutData, onAddWorkout }) => {
  if (!workoutData || workoutData.length === 0) return null;
  
  const handleAddWorkout = (workout: any) => {
    if (onAddWorkout) {
      onAddWorkout(workout);
    }
  };
  
  return (
    <div className="mt-4">
      <Card className="border border-purple-200">
        <CardHeader className="bg-purple-50 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
            <Dumbbell className="w-4 h-4 mr-2" /> 
            Suggested Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {workoutData.slice(0, 3).map((exercise, index) => (
              <div key={index} className="flex gap-3 items-center">
                {exercise.gifUrl && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={exercise.gifUrl} 
                      alt={exercise.name}
                      className="w-full h-full object-cover rounded" 
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{exercise.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1 text-xs text-gray-600">
                    <span className="bg-purple-100 px-1.5 py-0.5 rounded-full">
                      {exercise.target}
                    </span>
                    <span className="bg-blue-100 px-1.5 py-0.5 rounded-full">
                      {exercise.equipment}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {workoutData.length > 3 && (
              <p className="text-xs text-gray-500 text-center italic">
                +{workoutData.length - 3} more exercises available
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 pt-2">
          <Button 
            onClick={() => handleAddWorkout(workoutData[0])}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            Add to Your Workouts
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkoutPreview;
