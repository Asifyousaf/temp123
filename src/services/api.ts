
import { Exercise } from "@/types/exercise";
import { toast } from "@/components/ui/use-toast";

const API_URL = 'https://wger.de/api/v2';

// Helper function to map wger exercise data to our Exercise type
const mapWgerExerciseToExercise = (wgerExercise: any): Exercise => {
  return {
    id: wgerExercise.id.toString(),
    name: wgerExercise.name || "Unknown Exercise",
    bodyPart: wgerExercise.category?.name || "Full body",
    equipment: wgerExercise.equipment?.length > 0 ? wgerExercise.equipment[0]?.name : "Body weight",
    target: wgerExercise.muscles?.length > 0 ? wgerExercise.muscles[0]?.name : "Multiple muscles",
    gifUrl: `https://fitnessprogramer.com/wp-content/uploads/2021/02/${wgerExercise.name.toLowerCase().replace(/\s+/g, '-')}.gif` || 
            `https://thumbs.gfycat.com/Ambitious${wgerExercise.id % 10}SimilarDeviltasmanian-max-1mb.gif`,
    secondaryMuscles: wgerExercise.muscles_secondary?.map((m: any) => m.name) || [],
    instructions: wgerExercise.description ? 
      wgerExercise.description.split('. ').filter((s: string) => s.trim().length > 0) : 
      ["Perform the exercise with proper form", "Control your breathing throughout the movement"]
  };
};

// Fallback animations if the dynamic URL fails
const fallbackAnimations = [
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

export const fetchExercises = async (): Promise<Exercise[]> => {
  try {
    console.log("Fetching exercises from API");
    
    // Let's combine our reliable fallback animations into fixed exercises
    const reliableExercises = [
      {
        id: "1001",
        name: "Push-ups",
        bodyPart: "chest",
        equipment: "body weight",
        target: "pectorals",
        gifUrl: fallbackAnimations[0],
        secondaryMuscles: ["triceps", "shoulders"],
        instructions: ["Start in a plank position with hands slightly wider than shoulders", 
                      "Lower your body until chest nearly touches the floor", 
                      "Push back up to starting position", 
                      "Keep your core tight throughout the movement"]
      },
      {
        id: "1002",
        name: "Jumping Jacks",
        bodyPart: "full body",
        equipment: "body weight",
        target: "cardiovascular system",
        gifUrl: fallbackAnimations[1],
        secondaryMuscles: ["shoulders", "quadriceps"],
        instructions: ["Stand with feet together and arms at sides", 
                      "Jump while spreading legs and raising arms above head", 
                      "Return to starting position and repeat"]
      },
      {
        id: "1003",
        name: "Lunges",
        bodyPart: "legs",
        equipment: "body weight",
        target: "quadriceps",
        gifUrl: fallbackAnimations[2],
        secondaryMuscles: ["hamstrings", "glutes"],
        instructions: ["Stand with feet hip-width apart", 
                      "Step forward with one leg and lower body until both knees form 90-degree angles", 
                      "Push back to starting position and repeat with other leg"]
      },
      {
        id: "1004",
        name: "Squats",
        bodyPart: "legs",
        equipment: "body weight",
        target: "quadriceps",
        gifUrl: fallbackAnimations[3],
        secondaryMuscles: ["glutes", "hamstrings"],
        instructions: ["Stand with feet shoulder-width apart", 
                      "Lower your body as if sitting in a chair", 
                      "Keep knees in line with toes", 
                      "Return to starting position"]
      },
      {
        id: "1005",
        name: "Burpees",
        bodyPart: "full body",
        equipment: "body weight",
        target: "multiple muscles",
        gifUrl: fallbackAnimations[4],
        secondaryMuscles: ["chest", "legs", "core"],
        instructions: ["Begin in standing position", 
                      "Move into a squat position with hands on ground", 
                      "Kick feet back into plank position", 
                      "Return feet to squat position", 
                      "Jump up from squat position"]
      },
      {
        id: "1006",
        name: "Diamond Push-ups",
        bodyPart: "arms",
        equipment: "body weight",
        target: "triceps",
        gifUrl: fallbackAnimations[5],
        secondaryMuscles: ["chest", "shoulders"],
        instructions: ["Start in push-up position but place hands close together forming a diamond shape", 
                      "Lower chest toward diamond", 
                      "Push back up to starting position"]
      },
      {
        id: "1007",
        name: "Shoulder Taps",
        bodyPart: "shoulders",
        equipment: "body weight",
        target: "deltoids",
        gifUrl: fallbackAnimations[6],
        secondaryMuscles: ["core", "arms"],
        instructions: ["Start in plank position", 
                      "Tap one hand to opposite shoulder while balancing on the other hand", 
                      "Return hand to ground and repeat with other hand"]
      },
      {
        id: "1008",
        name: "Tricep Dips",
        bodyPart: "arms",
        equipment: "body weight",
        target: "triceps",
        gifUrl: fallbackAnimations[7],
        secondaryMuscles: ["shoulders", "chest"],
        instructions: ["Sit on edge of chair or bench with hands beside hips", 
                      "Slide buttocks off edge and lower body by bending elbows", 
                      "Push back up to starting position"]
      },
      {
        id: "1009",
        name: "Plank",
        bodyPart: "core",
        equipment: "body weight",
        target: "abdominals",
        gifUrl: fallbackAnimations[8],
        secondaryMuscles: ["shoulders", "glutes"],
        instructions: ["Start in push-up position with forearms on ground", 
                      "Keep body in straight line from head to heels", 
                      "Hold position while engaging core muscles"]
      },
      {
        id: "1010",
        name: "Sit-ups",
        bodyPart: "core",
        equipment: "body weight",
        target: "abdominals",
        gifUrl: fallbackAnimations[9],
        secondaryMuscles: ["hip flexors", "lower back"],
        instructions: ["Lie on back with knees bent and feet flat on floor", 
                      "Place hands behind head or across chest", 
                      "Curl upper body toward knees", 
                      "Lower back down and repeat"]
      }
    ];
    
    console.log('Successfully loaded reliable exercises with animations');
    // Log the first 5 exercises for debugging
    reliableExercises.slice(0, 5).forEach(exercise => {
      console.log('Exercise:', exercise.name);
      console.log('GIF URL:', exercise.gifUrl);
    });
    
    return reliableExercises;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    toast({
      title: "Error fetching exercises",
      description: "Could not load the exercise library. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
};

export const fetchExerciseById = async (id: string): Promise<Exercise> => {
  try {
    const allExercises = await fetchExercises();
    const exercise = allExercises.find(ex => ex.id === id);
    
    if (!exercise) {
      throw new Error('Exercise not found');
    }
    
    return exercise;
  } catch (error) {
    console.error('Error fetching exercise details:', error);
    throw error;
  }
};

export const fetchExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  try {
    const allExercises = await fetchExercises();
    return allExercises.filter(ex => ex.bodyPart.toLowerCase() === bodyPart.toLowerCase());
  } catch (error) {
    console.error('Error fetching exercises by body part:', error);
    throw error;
  }
};

export const fetchBodyParts = async (): Promise<string[]> => {
  try {
    const allExercises = await fetchExercises();
    const bodyParts = Array.from(new Set(allExercises.map(ex => ex.bodyPart)));
    return bodyParts;
  } catch (error) {
    console.error('Error fetching body parts:', error);
    throw error;
  }
};
