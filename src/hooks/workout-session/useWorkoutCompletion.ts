
import { toast } from "@/components/ui/use-toast";
import { WorkoutPlan } from "@/types/workout";

export const useWorkoutCompletion = (onComplete: (data: any) => void) => {
  const handleComplete = (
    workoutWithCalories: WorkoutPlan,
    totalTimeElapsed: number,
    completedExerciseDetails: {[key: string]: boolean},
    totalExercises: number
  ) => {
    const minutesSpent = Math.max(Math.round(totalTimeElapsed / 60), 1);
    
    const completedExerciseCount = Object.keys(completedExerciseDetails).length;
    
    const adjustedCompletionPercentage = totalExercises > 0 ? 
      completedExerciseCount / totalExercises : 0;
    
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
  
  return { handleComplete };
};
