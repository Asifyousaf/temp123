
import { useState } from 'react';
import { Exercise, WorkoutData, WorkoutPlan } from '@/types/workout';

export const useWorkoutSessionState = (workout: WorkoutData) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [completedExerciseDetails, setCompletedExerciseDetails] = useState<{[key: string]: boolean}>({});
  const [animateTimer, setAnimateTimer] = useState(false);
  const [activePackItemIndex, setActivePackItemIndex] = useState(0);
  const [skippedExercises, setSkippedExercises] = useState<{[key: string]: boolean}>({});

  // Format workout data
  const workoutWithCalories: WorkoutPlan = {
    ...workout,
    caloriesBurn: workout.caloriesBurn || workout.calories_burned || 300
  };
  
  return {
    // State variables
    currentExerciseIndex, setCurrentExerciseIndex,
    currentSet, setCurrentSet,
    isResting, setIsResting,
    isPaused, setIsPaused,
    timeLeft, setTimeLeft,
    totalTimeElapsed, setTotalTimeElapsed,
    completedExercises, setCompletedExercises,
    completedExerciseDetails, setCompletedExerciseDetails,
    animateTimer, setAnimateTimer,
    activePackItemIndex, setActivePackItemIndex,
    skippedExercises, setSkippedExercises,
    
    // Derived data
    workoutWithCalories
  };
};
