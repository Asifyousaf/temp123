
// This utility provides reliable exercise animations from API sources

// Map of exercise YouTube IDs for common exercises
const exerciseYoutubeIDs: Record<string, string> = {
  "push up": "IODxDxX7oi4",
  "pushup": "IODxDxX7oi4",
  "push-up": "IODxDxX7oi4",
  "squat": "gsNEn1c4iTw",
  "jumping jack": "c4DAnQ6DtF8",
  "jumping jacks": "c4DAnQ6DtF8",
  "plank": "pSHjTRCQxIw",
  "lunge": "QOVaHwm-Q6U",
  "burpee": "TU8QYVW0gDU",
  "mountain climber": "nmwgirgXLYM",
  "mountain climbers": "nmwgirgXLYM",
  "crunch": "Xyd_fa5zoEU",
  "sit up": "1fbU_MkV7NE",
  "sit-up": "1fbU_MkV7NE",
  "deadlift": "ytGaGIn3SjE",
  "pull up": "eGo4IYlbE5g",
  "pull-up": "eGo4IYlbE5g",
  "bench press": "rT7DgCr-3pg",
};

// MuscleWiki image URLs for common exercises
const muscleWikiImages: Record<string, string> = {
  "squat": "https://musclewiki.com/media/uploads/male-bodyweight-squat-side.gif",
  "push up": "https://musclewiki.com/media/uploads/male-pushup-side.gif",
  "pushup": "https://musclewiki.com/media/uploads/male-pushup-side.gif",
  "push-up": "https://musclewiki.com/media/uploads/male-pushup-side.gif",
  "lunge": "https://musclewiki.com/media/uploads/male-bodyweight-lunge-side.gif",
  "plank": "https://musclewiki.com/media/uploads/male-plank-side.gif",
  "crunch": "https://musclewiki.com/media/uploads/male-crunch-side.gif",
  "sit up": "https://musclewiki.com/media/uploads/male-situp-side.gif",
  "sit-up": "https://musclewiki.com/media/uploads/male-situp-side.gif",
  "deadlift": "https://musclewiki.com/media/uploads/male-deadlift-side.gif",
  "pull up": "https://musclewiki.com/media/uploads/male-pullup-side.gif",
  "pull-up": "https://musclewiki.com/media/uploads/male-pullup-side.gif",
  "bench press": "https://musclewiki.com/media/uploads/male-benchpress-side.gif",
  "calf raise": "https://musclewiki.com/media/uploads/male-bodyweight-calf-raise-side.gif",
  "jumping jack": "https://musclewiki.com/media/uploads/male-jumpingjack-front.gif",
  "jumping jacks": "https://musclewiki.com/media/uploads/male-jumpingjack-front.gif",
  "mountain climber": "https://musclewiki.com/media/uploads/male-mountainclimber-side.gif",
  "mountain climbers": "https://musclewiki.com/media/uploads/male-mountainclimber-side.gif",
  "burpee": "https://musclewiki.com/media/uploads/male-burpee-side.gif",
  "tricep dip": "https://musclewiki.com/media/uploads/male-tricep-dips-side.gif",
  "bicycle crunch": "https://musclewiki.com/media/uploads/male-bicycle-crunch-side.gif",
  "glute bridge": "https://musclewiki.com/media/uploads/male-glute-bridge-side.gif",
  "russian twist": "https://musclewiki.com/media/uploads/male-russian-twist-front.gif",
};

// WorkoutLabs image URLs for additional exercises
const workoutLabsImages: Record<string, string> = {
  "jump squat": "https://workoutlabs.com/wp-content/uploads/watermarked/Jump_Squat1.gif",
  "jumping squat": "https://workoutlabs.com/wp-content/uploads/watermarked/Jump_Squat1.gif",
  "push-up rotation": "https://workoutlabs.com/wp-content/uploads/watermarked/Push-up_with_Rotation1.gif",
  "side plank": "https://workoutlabs.com/wp-content/uploads/watermarked/Side_Forearm_Plank.gif",
  "superman": "https://workoutlabs.com/wp-content/uploads/watermarked/Superman1.gif",
  "high knees": "https://workoutlabs.com/wp-content/uploads/watermarked/High_Knees_Run_in_Place.gif",
  "leg raise": "https://workoutlabs.com/wp-content/uploads/watermarked/Lying_Straight_Leg_Raises.gif",
  "wall sit": "https://workoutlabs.com/wp-content/uploads/watermarked/Wall_Sit.gif",
  "bird dog": "https://workoutlabs.com/wp-content/uploads/watermarked/Bird_dogs1.gif",
  "kettlebell swing": "https://workoutlabs.com/wp-content/uploads/watermarked/Kettlebell_Swing1.gif"
};

// An array of reliable workout GIF animations as fallbacks
const reliableAnimations = [
  "https://media1.tenor.com/m/ATlOy9HYgLMAAAAC/push-ups.gif",
  "https://media1.tenor.com/m/2nEQqqxUb5wAAAAC/jumping-jacks-workout.gif", 
  "https://media1.tenor.com/m/swrtW4dXlYAAAAAC/lunge-exercise.gif",
  "https://media1.tenor.com/m/U7OXlvYxaTIAAAAC/squats.gif",
  "https://media1.tenor.com/m/ZC-WH4unx7YAAAAd/burpees-exercise.gif",
  "https://media1.tenor.com/m/gI-8qCUMSeMAAAAd/pushup.gif",
  "https://media1.tenor.com/m/0SO6-iX_RRYAAAAd/shoulder.gif",
  "https://media1.tenor.com/m/Jet8SkE99wYAAAAd/tricep.gif",
  "https://media1.tenor.com/m/K6_2KpT9MhQAAAAC/plank-exercise.gif",
  "https://media1.tenor.com/m/OF44QmJrRwkAAAAd/sit-ups.gif"
];

// Map common exercise keywords to animation indices
const exerciseKeywordMap: Record<string, number> = {
  'push': 0,
  'chest': 0,
  'push-up': 0,
  'pushup': 0,
  'jumping': 1,
  'jack': 1,
  'cardio': 1,
  'lunge': 2,
  'leg': 2,
  'squat': 3,
  'quad': 3,
  'burpee': 4,
  'hiit': 4,
  'diamond': 5,
  'push up': 5,
  'shoulder': 6,
  'delt': 6,
  'tricep': 7,
  'arm': 7,
  'plank': 8,
  'core': 8,
  'sit': 9,
  'ab': 9,
  'crunch': 9
};

interface ExerciseInfo {
  name?: string;
  bodyPart?: string;
  target?: string;
  id?: string | number;
  displayPreference?: 'video' | 'photo' | 'auto';
}

// Cache for exercise images to avoid repeated lookups
const exerciseImageCache: Record<string, string> = {};

/**
 * Gets the best animation URL for an exercise synchronously
 */
export const getBestExerciseImageUrlSync = (exercise: ExerciseInfo): string => {
  if (!exercise) return reliableAnimations[0];
  
  // If exercise already has a gifUrl that starts with https, use it
  if ('gifUrl' in exercise && typeof exercise.gifUrl === 'string' && 
      exercise.gifUrl.startsWith('https') && !exercise.gifUrl.includes('null')) {
    return exercise.gifUrl;
  }
  
  // If we have a cached image for this exercise, use it
  if (exercise.name && exerciseImageCache[exercise.name.toLowerCase()]) {
    return exerciseImageCache[exercise.name.toLowerCase()];
  }
  
  // Check for MuscleWiki image based on exercise name
  if (exercise.name) {
    const name = exercise.name.toLowerCase();
    
    // Check exact match in MuscleWiki
    if (muscleWikiImages[name]) {
      exerciseImageCache[name] = muscleWikiImages[name];
      return muscleWikiImages[name];
    }
    
    // Check partial match in MuscleWiki
    for (const [keyword, url] of Object.entries(muscleWikiImages)) {
      if (name.includes(keyword)) {
        exerciseImageCache[name] = url;
        return url;
      }
    }
    
    // Check in WorkoutLabs images
    if (workoutLabsImages[name]) {
      exerciseImageCache[name] = workoutLabsImages[name];
      return workoutLabsImages[name];
    }
    
    // Check partial match in WorkoutLabs
    for (const [keyword, url] of Object.entries(workoutLabsImages)) {
      if (name.includes(keyword)) {
        exerciseImageCache[name] = url;
        return url;
      }
    }
    
    // Use exercise name to find matching keywords for fallback animations
    for (const [keyword, index] of Object.entries(exerciseKeywordMap)) {
      if (name.includes(keyword)) {
        return reliableAnimations[index];
      }
    }
    
    // If no keyword matches, use first character of name to select an animation
    const firstChar = name.charAt(0);
    const index = firstChar.charCodeAt(0) % reliableAnimations.length;
    return reliableAnimations[index];
  }
  
  // If no name, try using bodyPart or target
  if (exercise.bodyPart) {
    const bodyPart = exercise.bodyPart.toLowerCase();
    for (const [keyword, index] of Object.entries(exerciseKeywordMap)) {
      if (bodyPart.includes(keyword)) {
        return reliableAnimations[index];
      }
    }
  }
  
  if (exercise.target) {
    const target = exercise.target.toLowerCase();
    for (const [keyword, index] of Object.entries(exerciseKeywordMap)) {
      if (target.includes(keyword)) {
        return reliableAnimations[index];
      }
    }
  }
  
  // Last resort: use ID to pick an animation
  if (exercise.id) {
    const idStr = String(exercise.id);
    const lastChar = idStr.charAt(idStr.length - 1);
    const index = parseInt(lastChar, 10) % reliableAnimations.length;
    return reliableAnimations[index >= 0 ? index : 0];
  }
  
  // Default fallback
  return reliableAnimations[0];
};

/**
 * Gets a YouTube video ID for an exercise if available
 */
export const getExerciseYoutubeId = (exercise: ExerciseInfo): string | undefined => {
  // Return undefined if display preference is explicitly set to photo
  if (exercise.displayPreference === 'photo') return undefined;

  if (!exercise || !exercise.name) return undefined;
  
  const name = exercise.name.toLowerCase();
  
  // Direct match
  if (exerciseYoutubeIDs[name]) {
    return exerciseYoutubeIDs[name];
  }
  
  // Partial match
  for (const [keyword, id] of Object.entries(exerciseYoutubeIDs)) {
    if (name.includes(keyword)) {
      return id;
    }
  }
  
  return undefined;
};

/**
 * Searches for an exercise image across all available sources
 */
export const searchExerciseImage = async (exerciseName: string): Promise<string | null> => {
  if (!exerciseName) return null;
  
  const name = exerciseName.toLowerCase();
  
  // Check cache first
  if (exerciseImageCache[name]) {
    return exerciseImageCache[name];
  }
  
  // Check MuscleWiki
  if (muscleWikiImages[name]) {
    exerciseImageCache[name] = muscleWikiImages[name];
    return muscleWikiImages[name];
  }
  
  // Check partial matches in MuscleWiki
  for (const [keyword, url] of Object.entries(muscleWikiImages)) {
    if (name.includes(keyword)) {
      exerciseImageCache[name] = url;
      return url;
    }
  }
  
  // Check WorkoutLabs
  if (workoutLabsImages[name]) {
    exerciseImageCache[name] = workoutLabsImages[name];
    return workoutLabsImages[name];
  }
  
  // Check partial matches in WorkoutLabs
  for (const [keyword, url] of Object.entries(workoutLabsImages)) {
    if (name.includes(keyword)) {
      exerciseImageCache[name] = url;
      return url;
    }
  }
  
  // Use fallback animations as last resort
  for (const [keyword, index] of Object.entries(exerciseKeywordMap)) {
    if (name.includes(keyword)) {
      return reliableAnimations[index];
    }
  }
  
  // Default fallback
  const index = name.charAt(0).charCodeAt(0) % reliableAnimations.length;
  return reliableAnimations[index];
};

// Export the array for direct access
export const getReliableAnimations = () => reliableAnimations;

// Export YouTube IDs map for direct access
export const getExerciseYoutubeIDs = () => exerciseYoutubeIDs;

// Export MuscleWiki images map for direct access
export const getMuscleWikiImages = () => muscleWikiImages;

// Export WorkoutLabs images map for direct access
export const getWorkoutLabsImages = () => workoutLabsImages;
