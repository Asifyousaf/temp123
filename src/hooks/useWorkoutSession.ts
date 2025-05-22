import { useState, useEffect, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Exercise, WorkoutData, WorkoutPlan } from '@/types/workout';
import { getBestExerciseImageUrlSync } from '@/utils/exerciseImageUtils';

export const useWorkoutSession = (workout: WorkoutData, onComplete: (data: any) => void) => {
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
  const timerRef = useRef<any>(null);

  // Format workout data
  const workoutWithCalories: WorkoutPlan = {
    ...workout,
    caloriesBurn: workout.caloriesBurn || workout.calories_burned || 300
  };

  // Determine if it's a workout pack
  const isWorkoutPack = workout?.isPack && Array.isArray(workout?.packItems) && workout?.packItems?.length > 0;
  
  const isAIGeneratedPack = !isWorkoutPack && 
    typeof workout?.exercises === 'object' && 
    (workout?.exercises as any)?.isWorkoutPack === true &&
    Array.isArray((workout?.exercises as any)?.list);
  
  // Get active workout and exercises
  let activeWorkout: WorkoutPlan = workoutWithCalories;
  let exercises: Exercise[] = [];
  
  if (isWorkoutPack && workout?.packItems) {
    const packItem = workout.packItems[activePackItemIndex] || workout;
    activeWorkout = {
      ...packItem,
      caloriesBurn: packItem.caloriesBurn || packItem.calories_burned || 300
    };
    exercises = Array.isArray(activeWorkout?.exercises) ? activeWorkout.exercises : [];
  } else if (isAIGeneratedPack) {
    const exercisesList = (workout?.exercises as any)?.list || [];
    exercises = exercisesList;
    
    if ((workout?.exercises as any)?.originalWorkouts) {
      workout.packItems = (workout?.exercises as any)?.originalWorkouts;
    }
    
    workout.isPack = true;
  } else {
    exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
  }
  
  const currentExercise = exercises[currentExerciseIndex] || null;
  const totalExercises = isWorkoutPack && workout?.packItems
    ? workout.packItems.reduce((sum, w) => 
        sum + (Array.isArray(w?.exercises) ? w.exercises.length : 0), 0)
    : exercises.length;
  const progress = Math.round((completedExercises / Math.max(totalExercises, 1)) * 100);

  // Timer functionality
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setAnimateTimer(true);
            setTimeout(() => setAnimateTimer(false), 1000);
            return 0;
          }
          return prev - 1;
        });
        
        setTotalTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPaused]);

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

  const handleComplete = async () => {
    const minutesSpent = Math.max(Math.round(totalTimeElapsed / 60), 1);
    
    const completedExerciseCount = Object.keys(completedExerciseDetails).length;
    const totalExerciseCount = totalExercises;
    
    const adjustedCompletionPercentage = totalExerciseCount > 0 ? 
      completedExerciseCount / totalExerciseCount : 0;
    
    const minCaloriePercentage = 0.3;
    const caloriesBurn = workoutWithCalories.caloriesBurn || workoutWithCalories.calories_burned || 300; 
    const workoutDuration = workoutWithCalories.duration || 30;
    
    const estimatedCalories = Math.round(
      caloriesBurn * Math.max(
        adjustedCompletionPercentage,
        Math.min(minutesSpent / workoutDuration, 1) * adjustedCompletionPercentage,
        minCaloriePercentage * adjustedCompletionPercentage
      )
    );
    
    const workoutData = {
      title: workoutWithCalories.title,
      type: workoutWithCalories.type,
      duration: minutesSpent,
      calories_burned: estimatedCalories
    };
    
    toast({
      title: "Workout Complete!",
      description: `You burned approximately ${estimatedCalories} calories in ${minutesSpent} minutes.`,
    });
    
    onComplete(workoutData);
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
