
import React from 'react';
import WorkoutCard from './WorkoutCard';
import { WorkoutData } from '@/types/workout';
import { getBestExerciseImageUrlSync, getExerciseYoutubeId } from '@/utils/exerciseImageUtils';
import { Exercise } from '@/types/exercise';

interface WorkoutsListProps {
  workouts: WorkoutData[];
  onStartWorkout: (workout: WorkoutData) => void;
  onDeleteWorkout?: (workoutId: string) => void;
  userId?: string;
  isLoading?: boolean;
}

const WorkoutsList: React.FC<WorkoutsListProps> = ({ 
  workouts,
  onStartWorkout,
  onDeleteWorkout,
  userId,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div 
            key={item} 
            className="bg-gray-100 rounded-lg h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No workouts found matching your search.</p>
      </div>
    );
  }

  // Ensure all workout exercises have the necessary properties
  const prepareWorkout = (workout: WorkoutData): WorkoutData => {
    if (!workout) return workout;
    
    // Process exercises to ensure they have proper image URLs and YouTube IDs
    if (Array.isArray(workout.exercises)) {
      workout.exercises = workout.exercises.map((exercise: any) => ({
        ...exercise,
        gifUrl: getBestExerciseImageUrlSync(exercise),
        youtubeId: getExerciseYoutubeId(exercise),
        displayPreference: exercise.displayPreference || 'auto'
      }));
    }
    
    // If it's a workout pack, also process the packItems
    if (workout.isPack && Array.isArray(workout.packItems)) {
      workout.packItems = workout.packItems.map(packItem => {
        if (Array.isArray(packItem.exercises)) {
          return {
            ...packItem,
            exercises: packItem.exercises.map((exercise: any) => ({
              ...exercise,
              gifUrl: getBestExerciseImageUrlSync(exercise),
              youtubeId: getExerciseYoutubeId(exercise),
              displayPreference: exercise.displayPreference || 'auto'
            }))
          };
        }
        return packItem;
      });
    }
    
    return workout;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onStart={() => onStartWorkout(prepareWorkout(workout))}
          onDelete={onDeleteWorkout}
          userId={userId}
        />
      ))}
    </div>
  );
};

export default WorkoutsList;
