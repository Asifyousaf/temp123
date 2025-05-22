
import React from 'react';
import { XCircle, Check, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WorkoutStats from './workouts/WorkoutStats';
import WorkoutExerciseView from './workouts/WorkoutExerciseView';
import WorkoutCompletionView from './workouts/WorkoutCompletionView';
import WorkoutPackTabs from './workouts/WorkoutPackTabs';
import WorkoutProgress, { WorkoutHeader } from './workouts/WorkoutProgress';
import { WorkoutData } from '@/types/workout';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { getBestExerciseImageUrlSync } from '@/utils/exerciseImageUtils';

interface WorkoutSessionProps {
  workout: WorkoutData;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const WorkoutSession = ({ workout, onComplete, onCancel }: WorkoutSessionProps) => {
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

  // Ensure current exercise has a valid image URL
  const getExerciseImageUrl = (exercise) => {
    if (!exercise) return null;
    
    // Use the utility to get the best image URL
    return getBestExerciseImageUrlSync(exercise);
  };

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

        {currentExerciseIndex < exercises.length && currentExercise ? (
          <div className="space-y-8">
            <WorkoutExerciseView
              exercise={{
                ...currentExercise,
                gifUrl: getExerciseImageUrl(currentExercise)
              }}
              currentSet={currentSet}
              totalSets={currentExercise.sets || 3}
              remainingSeconds={timeLeft}
              isRest={isResting}
              isPaused={isPaused}
              onTogglePause={handlePlayPause}
              onComplete={isResting ? 
                () => {
                  setIsResting(false);
                  setTimeLeft(currentExercise.duration || 60);
                } : 
                () => {
                  if (currentSet < (currentExercise.sets || 3)) {
                    setIsResting(true);
                    setTimeLeft(60); // Default rest time
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
