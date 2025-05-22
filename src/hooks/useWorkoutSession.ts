
import { useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Exercise, WorkoutData } from '@/types/workout';
import { useWorkoutSessionState } from './workout-session/useWorkoutSessionState';
import { determineWorkoutTypes, getWorkoutExercises } from './workout-session/workoutTypeUtils';
import { useWorkoutTimer } from './workout-session/useWorkoutTimer';
import { useWorkoutCompletion } from './workout-session/useWorkoutCompletion';

export const useWorkoutSession = (workout: WorkoutData, onComplete: (data: any) => void) => {
  // Get state management
  const {
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
    workoutWithCalories
  } = useWorkoutSessionState(workout);
  
  // Setup timer
  useWorkoutTimer(isPaused, setTimeLeft, setTotalTimeElapsed, setAnimateTimer);
  
  // Get workout type information
  const { isWorkoutPack, isAIGeneratedPack } = determineWorkoutTypes(workout);
  
  // Get active workout and exercises
  const { activeWorkout, exercises } = getWorkoutExercises(workout, activePackItemIndex);
  
  // Get current exercise
  const currentExercise = exercises[currentExerciseIndex] || null;
  
  // Calculate total exercises
  const totalExercises = isWorkoutPack && workout?.packItems
    ? workout.packItems.reduce((sum, w) => 
        sum + (Array.isArray(w?.exercises) ? w.exercises.length : 0), 0)
    : exercises.length;
    
  // Calculate progress
  const progress = Math.round((completedExercises / Math.max(totalExercises, 1)) * 100);
  
  // Get completion handler
  const { handleComplete: completeWorkout } = useWorkoutCompletion(onComplete);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && !isPaused) {
      if (isResting) {
        setIsResting(false);
        
        if (currentExercise && currentSet < currentExercise.sets) {
          setCurrentSet(prev => prev + 1);
          setTimeLeft(currentExercise.duration);
        } else {
          handleNextExercise();
        }
      } else {
        if (currentExercise && currentSet < currentExercise.sets) {
          setIsResting(true);
          setTimeLeft(currentExercise.restTime);
        } else {
          handleNextExercise();
        }
      }
    }
  }, [timeLeft, isPaused]);

  // Reset timer when exercise changes
  useEffect(() => {
    resetExerciseTimer();
  }, [currentExerciseIndex, activePackItemIndex]);

  const resetExerciseTimer = () => {
    if (currentExerciseIndex < exercises.length && currentExercise) {
      setTimeLeft(isResting ? currentExercise.restTime : currentExercise.duration);
    }
  };

  const handlePlayPause = () => {
    setIsPaused(prev => !prev);
  };

  const handleNextExercise = () => {
    if (currentExercise && !completedExerciseDetails[currentExercise.name]) {
      setSkippedExercises(prev => ({
        ...prev,
        [currentExercise.name]: true
      }));
    }
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setIsPaused(true);
    } else if (isWorkoutPack && workout?.packItems && activePackItemIndex < workout.packItems.length - 1) {
      setActivePackItemIndex(prev => prev + 1);
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      setIsResting(false);
      setIsPaused(true);
      
      toast({
        title: "Moving to next workout",
        description: `Starting ${workout.packItems[activePackItemIndex + 1].title}`,
      });
    } else {
      handleComplete();
    }
  };

  const handleCompleteExercise = () => {
    if (currentExercise) {
      const exerciseName = currentExercise.name;
      
      if (!completedExerciseDetails[exerciseName]) {
        setCompletedExerciseDetails(prev => ({
          ...prev,
          [exerciseName]: true
        }));
        setCompletedExercises(prev => prev + 1);
        
        if (skippedExercises[exerciseName]) {
          const newSkipped = {...skippedExercises};
          delete newSkipped[exerciseName];
          setSkippedExercises(newSkipped);
        }
      }
    }
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setIsPaused(true);
    } else if (isWorkoutPack && workout?.packItems && activePackItemIndex < workout.packItems.length - 1) {
      setActivePackItemIndex(prev => prev + 1);
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      setIsResting(false);
      setIsPaused(true);
      
      toast({
        title: "Moving to next workout",
        description: `Starting ${workout.packItems[activePackItemIndex + 1].title}`,
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    completeWorkout(
      workoutWithCalories, 
      totalTimeElapsed, 
      completedExerciseDetails,
      totalExercises
    );
  };
  
  return {
    currentExerciseIndex,
    currentSet,
    isResting,
    isPaused,
    timeLeft,
    totalTimeElapsed,
    completedExercises,
    animateTimer,
    activePackItemIndex,
    progress,
    isWorkoutPack,
    isAIGeneratedPack,
    workoutWithCalories,
    activeWorkout,
    exercises,
    currentExercise,
    totalExercises,
    setActivePackItemIndex,
    setIsResting,
    setTimeLeft,
    setCurrentSet,
    handlePlayPause,
    handleNextExercise,
    handleCompleteExercise,
    handleComplete,
    completedExerciseDetails
  };
};
