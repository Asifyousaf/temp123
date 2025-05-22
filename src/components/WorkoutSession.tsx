
import React, { useEffect, useState } from 'react';
import { XCircle, Check, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WorkoutStats from './workouts/WorkoutStats';
import WorkoutExerciseView from './workouts/WorkoutExerciseView';
import WorkoutCompletionView from './workouts/WorkoutCompletionView';
import WorkoutPackTabs from './workouts/WorkoutPackTabs';
import WorkoutProgress, { WorkoutHeader } from './workouts/WorkoutProgress';
import { Exercise, WorkoutData } from '@/types/workout';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { getBestExerciseImageUrlSync, getEnhancedExerciseData } from '@/utils/exerciseImageUtils';
import { toast } from "@/components/ui/use-toast";

interface WorkoutSessionProps {
  workout: WorkoutData;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const WorkoutSession = ({ workout, onComplete, onCancel }: WorkoutSessionProps) => {
  const [enhancedExercises, setEnhancedExercises] = useState<{[key: string]: Exercise}>({});
  const [loadingExercises, setLoadingExercises] = useState<boolean>(true);
  
  const {
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
  } = useWorkoutSession(workout, onComplete);

  // Fetch enhanced exercise data from API when exercises change
  useEffect(() => {
    const fetchEnhancedExercises = async () => {
      setLoadingExercises(true);
      
      try {
        const enhancedData: {[key: string]: Exercise} = {};
        
        // Process exercises in batches to avoid overwhelming the API
        for (const exercise of exercises) {
          if (!exercise) continue;
          
          // Skip if we already have data for this exercise
          if (enhancedExercises[exercise.name]) continue;
          
          // Get enhanced data with GIFs, images, and instructions
          const enhancedExercise = await getEnhancedExerciseData(exercise);
          enhancedData[exercise.name] = enhancedExercise;
        }
        
        setEnhancedExercises(prev => ({...prev, ...enhancedData}));
        console.log("Enhanced exercises loaded:", Object.keys(enhancedData).length);
      } catch (error) {
        console.error("Error enhancing exercise data:", error);
        toast({
          title: "Couldn't load all exercise animations",
          description: "Some exercises might not have animations available.",
          variant: "destructive"
        });
      } finally {
        setLoadingExercises(false);
      }
    };
    
    if (exercises && exercises.length > 0) {
      fetchEnhancedExercises();
    }
  }, [exercises, activePackItemIndex]);

  // Handle invalid workout data
  if (!workout || !activeWorkout) {
    return (
      <Card className="w-full border-2 border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle>Invalid Workout Data</CardTitle>
          <CardDescription>Unable to load workout information</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="mb-4">Sorry, there was an issue loading this workout.</p>
          <Button onClick={onCancel}>Return to Workouts</Button>
        </CardContent>
      </Card>
    );
  }

  // Get the enhanced exercise data if available
  const getEnhancedExercise = (exercise: Exercise | null): Exercise | null => {
    if (!exercise) return null;
    return enhancedExercises[exercise.name] || exercise;
  };

  // Get current exercise with enhancements
  const enhancedCurrentExercise = getEnhancedExercise(currentExercise);

  return (
    <Card className="w-full border-2 border-purple-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle>
          <WorkoutHeader 
            title={workout.title}
            description={workout.description}
            isWorkoutPack={isWorkoutPack}
            isAIGeneratedPack={isAIGeneratedPack}
          />
        </CardTitle>
        <CardDescription>
          {workout.description || 'AI-generated workout routine'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 py-6 px-4 md:px-6">
        <WorkoutPackTabs
          isWorkoutPack={isWorkoutPack}
          isAIGeneratedPack={isAIGeneratedPack}
          activePackItemIndex={activePackItemIndex}
          packItems={workout.packItems}
          exercises={exercises}
          onValueChange={(value) => setActivePackItemIndex(parseInt(value))}
        />
        
        <WorkoutProgress
          progress={progress}
          isWorkoutPack={isWorkoutPack}
          isAIGeneratedPack={isAIGeneratedPack}
          activeWorkout={activeWorkout}
          currentExercise={currentExercise}
          activePackItemIndex={activePackItemIndex}
          packItems={workout.packItems}
          exercises={exercises}
        />

        {currentExerciseIndex < exercises.length && enhancedCurrentExercise ? (
          <div className="space-y-8">
            <WorkoutExerciseView
              exercise={enhancedCurrentExercise}
              currentSet={currentSet}
              totalSets={enhancedCurrentExercise.sets || 3}
              remainingSeconds={timeLeft}
              isRest={isResting}
              isPaused={isPaused}
              isLoading={loadingExercises && currentExerciseIndex === 0}
              onTogglePause={handlePlayPause}
              onComplete={isResting ? 
                () => {
                  setIsResting(false);
                  setTimeLeft(enhancedCurrentExercise.duration || 60);
                } : 
                () => {
                  if (currentSet < (enhancedCurrentExercise.sets || 3)) {
                    setIsResting(true);
                    setTimeLeft(enhancedCurrentExercise.restTime || 60); // Rest time
                    setCurrentSet(prev => prev + 1);
                  } else {
                    handleCompleteExercise();
                  }
                }
              }
            />

            <WorkoutStats
              totalTimeElapsed={totalTimeElapsed}
              caloriesBurn={workoutWithCalories.caloriesBurn}
              duration={workoutWithCalories.duration}
            />
          </div>
        ) : (
          <WorkoutCompletionView
            timeElapsed={totalTimeElapsed}
            caloriesBurned={Math.round((workoutWithCalories.caloriesBurn || 300) * 
              (totalTimeElapsed / 60) / (workoutWithCalories.duration || 30) * 
              (Object.keys(completedExerciseDetails).length / Math.max(totalExercises, 1))
            )}
            exercisesCompleted={Object.keys(completedExerciseDetails).length}
            onComplete={handleComplete}
          />
        )}
      </CardContent>

      <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg p-4 md:p-6">
        <Button variant="outline" onClick={onCancel} className="border-red-200 text-red-600 hover:bg-red-50">
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Workout
        </Button>
        {currentExerciseIndex >= exercises.length ? (
          <Button onClick={handleComplete} className="bg-purple-600 hover:bg-purple-700">
            <Check className="mr-2 h-4 w-4" />
            Complete Workout
          </Button>
        ) : (
          <Button onClick={handleNextExercise} variant="default" className="bg-purple-600 hover:bg-purple-700">
            Skip Exercise
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WorkoutSession;
