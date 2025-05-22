
import { Exercise } from '@/types/workout';

// Get the best available image URL for an exercise
export const getBestExerciseImageUrlSync = (exercise: any): string => {
  // If the exercise already has a gifUrl, use it
  if (exercise.gifUrl) {
    return exercise.gifUrl;
  }

  // Based on exercise name, return a specific fallback
  const exerciseName = (exercise.name || exercise.title || '').toLowerCase();
  
  if (exerciseName.includes('push') || exerciseName.includes('push-up')) {
    return '/fallbacks/dips.gif';
  }
  if (exerciseName.includes('squat')) {
    return '/fallbacks/squats.gif';
  }
  if (exerciseName.includes('plank')) {
    return '/fallbacks/plank.gif';
  }
  if (exerciseName.includes('burpee')) {
    return '/fallbacks/burpees.gif';
  }
  if (exerciseName.includes('run')) {
    return '/fallbacks/running.gif';
  }
  if (exerciseName.includes('pull')) {
    return '/fallbacks/pull-ups.gif';
  }

  // Default fallback
  return '/fallbacks/default.gif';
};

// Get YouTube ID for an exercise if available
export const getExerciseYoutubeId = (exercise: any): string | undefined => {
  return exercise.youtubeId || undefined;
};
