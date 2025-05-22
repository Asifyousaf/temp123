
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
    return '/fallbacks/push-ups.gif';
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

// Search for an exercise image
export const searchExerciseImage = async (query: string): Promise<string> => {
  // This is a simplified implementation that returns a fallback image based on the query
  const searchTerm = query.toLowerCase();
  
  if (searchTerm.includes('push')) return '/fallbacks/push-ups.gif';
  if (searchTerm.includes('squat')) return '/fallbacks/squats.gif';
  if (searchTerm.includes('plank')) return '/fallbacks/plank.gif';
  if (searchTerm.includes('burpee')) return '/fallbacks/burpees.gif';
  if (searchTerm.includes('run')) return '/fallbacks/running.gif';
  if (searchTerm.includes('pull')) return '/fallbacks/pull-ups.gif';
  if (searchTerm.includes('curl')) return '/fallbacks/bicep-curl.gif';
  if (searchTerm.includes('deadlift')) return '/fallbacks/deadlift.gif';
  if (searchTerm.includes('jack')) return '/fallbacks/jumping-jacks.gif';
  if (searchTerm.includes('mountain')) return '/fallbacks/mountain-climbers.gif';
  if (searchTerm.includes('russian')) return '/fallbacks/russian-twists.gif';
  
  return '/fallbacks/default.gif';
};
