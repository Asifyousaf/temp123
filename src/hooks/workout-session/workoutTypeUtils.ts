
import { WorkoutData } from '@/types/workout';

export const determineWorkoutTypes = (workout: WorkoutData) => {
  // Determine if it's a workout pack
  const isWorkoutPack = workout?.isPack && Array.isArray(workout?.packItems) && workout?.packItems?.length > 0;
  
  const isAIGeneratedPack = !isWorkoutPack && 
    typeof workout?.exercises === 'object' && 
    (workout?.exercises as any)?.isWorkoutPack === true &&
    Array.isArray((workout?.exercises as any)?.list);
    
  return {
    isWorkoutPack,
    isAIGeneratedPack
  };
};

export const getWorkoutExercises = (workout: WorkoutData, activePackItemIndex: number) => {
  const { isWorkoutPack, isAIGeneratedPack } = determineWorkoutTypes(workout);
  
  if (isWorkoutPack && workout?.packItems) {
    const packItem = workout.packItems[activePackItemIndex] || workout;
    const activeWorkout = {
      ...packItem,
      caloriesBurn: packItem.caloriesBurn || packItem.calories_burned || 300
    };
    return {
      activeWorkout,
      exercises: Array.isArray(activeWorkout?.exercises) ? activeWorkout.exercises : []
    };
  } else if (isAIGeneratedPack) {
    const exercisesList = (workout?.exercises as any)?.list || [];
    
    // Handle AI-generated pack structure
    if ((workout?.exercises as any)?.originalWorkouts) {
      workout.packItems = (workout?.exercises as any)?.originalWorkouts;
    }
    workout.isPack = true;
    
    return {
      activeWorkout: workout,
      exercises: exercisesList
    };
  } else {
    // Regular workout
    return {
      activeWorkout: workout,
      exercises: Array.isArray(workout?.exercises) ? workout.exercises : []
    };
  }
};
