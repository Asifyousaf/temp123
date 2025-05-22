import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { WorkoutData, WorkoutDataExtended, Exercise, WorkoutExercisesData } from '@/types/workout';
import { formatWorkout, defaultWorkoutPlans } from '@/utils/workoutUtils';

export const useWorkouts = (userId?: string) => {
  const [loading, setLoading] = useState(true);
  const [userWorkouts, setUserWorkouts] = useState<WorkoutData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (userId) {
      fetchUserWorkouts(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserWorkouts = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      console.log('Fetched user workouts:', data);
      
      if (data) {
        // Use type assertion to tell TypeScript the data structure
        const formattedWorkouts = data.map((workout) => {
          // Parse exercises if they exist and are in string format
          let parsedExercises: Exercise[] | WorkoutExercisesData | undefined = undefined;
          
          if (workout.exercises) {
            try {
              // If exercises is already an object, use it directly
              if (typeof workout.exercises === 'object') {
                parsedExercises = workout.exercises as unknown as Exercise[] | WorkoutExercisesData;
              } else if (typeof workout.exercises === 'string') {
                // If exercises is a string, parse it
                parsedExercises = JSON.parse(workout.exercises) as Exercise[] | WorkoutExercisesData;
              }
            } catch (e) {
              console.error('Error parsing exercises:', e);
            }
          }
          
          // Create a properly typed workout object
          const typedWorkout: WorkoutDataExtended = {
            ...workout,
            exercises: parsedExercises || []
          };
          
          return formatWorkout(typedWorkout);
        });
        
        setUserWorkouts(formattedWorkouts);
      }
      
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      toast({
        title: "Error",
        description: "Failed to load your custom workouts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      if (!userId) return;
      
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
      
      setUserWorkouts(prev => prev.filter(w => w.id !== workoutId));
      
      toast({
        title: "Workout Deleted",
        description: "The workout has been removed from your collection",
      });
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive"
      });
    }
  };

  const allWorkouts = [...defaultWorkoutPlans, ...userWorkouts];

  const filteredWorkouts = allWorkouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (workout.description && workout.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || 
                          (filter === 'custom' && workout.level === 'custom') ||
                          (filter === 'pack' && workout.isPack) ||
                          (filter !== 'custom' && filter !== 'pack' && workout.level === filter);
    return matchesSearch && matchesFilter;
  });

  return {
    loading,
    userWorkouts,
    allWorkouts,
    filteredWorkouts,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    handleDeleteWorkout,
    refreshUserWorkouts: () => userId && fetchUserWorkouts(userId)
  };
};
