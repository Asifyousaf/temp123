
import { Exercise } from '@/types/workout';
import { getBestMatchingExercise } from '@/services/exerciseDbService';

// Get the best available image URL for an exercise - synchronous version for immediate UI rendering
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
  if (exerciseName.includes('curl')) {
    return '/fallbacks/bicep-curl.gif';
  }
  if (exerciseName.includes('deadlift')) {
    return '/fallbacks/deadlift.gif';
  }
  if (exerciseName.includes('jump')) {
    return '/fallbacks/jumping-jacks.gif';
  }
  if (exerciseName.includes('mountain')) {
    return '/fallbacks/mountain-climbers.gif';
  }
  if (exerciseName.includes('russian')) {
    return '/fallbacks/russian-twists.gif';
  }
  if (exerciseName.includes('dip')) {
    return '/fallbacks/dips.gif';
  }

  // Default fallback
  return '/fallbacks/default.gif';
};

// Get the best available image URL for an exercise - async version that fetches from API
export const getBestExerciseImageUrl = async (exercise: any): Promise<string> => {
  // If the exercise already has a gifUrl, use it
  if (exercise.gifUrl) {
    return exercise.gifUrl;
  }
  
  try {
    // Try to fetch from ExerciseDB API
    const exerciseName = exercise.name || exercise.title || '';
    const apiExercise = await getBestMatchingExercise(exerciseName);
    
    if (apiExercise?.gifUrl) {
      console.log(`Found API gif for ${exerciseName}: ${apiExercise.gifUrl}`);
      return apiExercise.gifUrl;
    }
  } catch (error) {
    console.error('Error fetching exercise image from API:', error);
  }
  
  // Fall back to sync method if API fails
  return getBestExerciseImageUrlSync(exercise);
};

// Get YouTube ID for an exercise if available
export const getExerciseYoutubeId = (exercise: any): string | undefined => {
  return exercise.youtubeId || undefined;
};

// Search for an exercise image
export const searchExerciseImage = async (query: string): Promise<string> => {
  try {
    // Try to fetch from ExerciseDB API
    const apiExercise = await getBestMatchingExercise(query);
    
    if (apiExercise?.gifUrl) {
      console.log(`Found API gif for query "${query}": ${apiExercise.gifUrl}`);
      return apiExercise.gifUrl;
    }
  } catch (error) {
    console.error('Error searching exercise image from API:', error);
  }
  
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
  if (searchTerm.includes('dip')) return '/fallbacks/dips.gif';
  
  return '/fallbacks/default.gif';
};

// Fetch all relevant exercise data including image and instructions
export const getEnhancedExerciseData = async (exercise: any): Promise<Exercise> => {
  try {
    // Try to fetch from ExerciseDB API
    const exerciseName = exercise.name || exercise.title || '';
    const apiExercise = await getBestMatchingExercise(exerciseName);
    
    if (apiExercise) {
      // Merge data from API with our exercise data
      return {
        ...exercise,
        gifUrl: apiExercise.gifUrl || exercise.gifUrl || getBestExerciseImageUrlSync(exercise),
        bodyPart: apiExercise.bodyPart || exercise.bodyPart || 'full body',
        equipment: apiExercise.equipment || exercise.equipment || 'body weight',
        target: apiExercise.target || exercise.target || 'multiple muscles',
        secondaryMuscles: apiExercise.secondaryMuscles || exercise.secondaryMuscles || [],
        instructions: apiExercise.instructions || exercise.instructions || [],
      };
    }
  } catch (error) {
    console.error('Error enhancing exercise data:', error);
  }
  
  // Return original exercise with fallback image if API fails
  return {
    ...exercise,
    gifUrl: exercise.gifUrl || getBestExerciseImageUrlSync(exercise),
    instructions: exercise.instructions || ['Perform the exercise with proper form'],
  };
};
