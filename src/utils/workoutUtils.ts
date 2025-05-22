
import { WorkoutData, WorkoutDataExtended, Exercise, WorkoutExercisesData } from '@/types/workout';

// Helper function to format a workout from database format to app format
export const formatWorkout = (workout: WorkoutDataExtended): WorkoutData => {
  // Normalize the workout data to ensure consistent structure
  let formattedExercises: Exercise[] | WorkoutExercisesData = [];
  
  // Properly handle the exercises conversion based on type
  if (workout.exercises) {
    if (Array.isArray(workout.exercises)) {
      formattedExercises = workout.exercises as Exercise[];
    } else if (typeof workout.exercises === 'object') {
      formattedExercises = workout.exercises as WorkoutExercisesData;
    }
  }

  return {
    id: workout.id,
    title: workout.title || '',
    type: workout.type || 'General',
    description: workout.description || '',
    level: workout.level || 'beginner',
    duration: workout.duration || 30,
    calories_burned: workout.calories_burned || 300,
    caloriesBurn: workout.calories_burned || workout.caloriesBurn || 300,
    exercises: formattedExercises,
    image: workout.image || '',
    user_id: workout.user_id || '',
    isPack: workout.isPack || false
  };
};

// Sample workout plans
export const defaultWorkoutPlans: WorkoutData[] = [
  {
    id: 'default-1',
    title: '30-Minute Full Body HIIT',
    type: 'HIIT',
    description: 'A high-intensity workout that targets all major muscle groups',
    level: 'beginner',
    duration: 30,
    calories_burned: 300,
    exercises: [
      {
        name: 'Jumping Jacks',
        sets: 3,
        reps: 20,
        duration: 60,
        restTime: 30,
        instructions: ['Start with feet together and arms at sides', 'Jump to spread legs and raise arms']
      },
      {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        duration: 60,
        restTime: 30,
        instructions: ['Start in plank position', 'Lower body to ground', 'Push back up']
      },
      {
        name: 'Squats',
        sets: 3,
        reps: 15,
        duration: 60,
        restTime: 30,
        instructions: ['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Return to standing']
      }
    ],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2340&q=80'
  },
  {
    id: 'default-2',
    title: '20-Minute Core Crusher',
    type: 'Strength',
    description: 'Focus on strengthening your core with this targeted workout',
    level: 'intermediate',
    duration: 20,
    calories_burned: 200,
    exercises: [
      {
        name: 'Plank',
        sets: 3,
        reps: 1,
        duration: 60,
        restTime: 30,
        instructions: ['Start in forearm plank position', 'Maintain straight body alignment', 'Hold position']
      },
      {
        name: 'Crunches',
        sets: 3,
        reps: 20,
        duration: 60,
        restTime: 30,
        instructions: ['Lie on back with knees bent', 'Curl shoulders off the ground', 'Lower back down with control']
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: 20,
        duration: 60,
        restTime: 30,
        instructions: ['Sit with knees bent and feet off ground', 'Twist torso from side to side', 'Keep core engaged throughout']
      }
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2340&q=80'
  },
  {
    id: 'default-3',
    title: '15-Minute Cardio Blast',
    type: 'Cardio',
    description: 'A quick cardio workout to get your heart rate up',
    level: 'all',
    duration: 15,
    calories_burned: 150,
    exercises: [
      {
        name: 'High Knees',
        sets: 3,
        reps: 30,
        duration: 45,
        restTime: 15,
        instructions: ['Run in place', 'Lift knees to hip level', 'Pump arms in opposition']
      },
      {
        name: 'Burpees',
        sets: 3,
        reps: 10,
        duration: 60,
        restTime: 20,
        instructions: ['Start standing', 'Drop to push-up position', 'Do a push-up', 'Jump feet toward hands', 'Explode upward with a jump']
      },
      {
        name: 'Mountain Climbers',
        sets: 3,
        reps: 20,
        duration: 45,
        restTime: 15,
        instructions: ['Start in plank position', 'Drive knees toward chest alternately', 'Keep hips level throughout']
      }
    ],
    image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=2340&q=80'
  }
];
