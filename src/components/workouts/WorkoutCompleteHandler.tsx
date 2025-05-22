
import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { WorkoutData } from '@/types/workout';

interface WorkoutCompleteHandlerProps {
  activeWorkout: WorkoutData | null;
  session: any;
  onCompleteWorkout: (workoutData: any) => void;
  onCancelWorkout: () => void;
}

const WorkoutCompleteHandler: React.FC<WorkoutCompleteHandlerProps> = ({
  activeWorkout,
  session,
  onCompleteWorkout,
  onCancelWorkout
}) => {
  const navigate = useNavigate();

  const handleCompleteWorkout = async (workoutData: any) => {
    try {
      if (!session) return;
      
      const { error } = await supabase.from('workouts').insert({
        user_id: session.user.id,
        title: workoutData.title,
        type: workoutData.type,
        duration: workoutData.duration,
        calories_burned: workoutData.calories_burned,
        date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      
      toast({
        title: "Workout Completed",
        description: `Great job! Burned ${workoutData.calories_burned} calories in ${workoutData.duration} minutes.`,
      });
      
      onCompleteWorkout(workoutData);
      navigate('/workout-tracker');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log your workout",
        variant: "destructive"
      });
      console.error('Error saving workout:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {activeWorkout && (
        <button 
          onClick={onCancelWorkout} 
          className="flex items-center text-purple-600 mb-6 hover:text-purple-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Workouts
        </button>
      )}
      
      {activeWorkout && (
        <WorkoutSession 
          workout={{
            ...activeWorkout,
            description: activeWorkout.description || '',
            level: activeWorkout.level || 'beginner',
            caloriesBurn: activeWorkout.calories_burned || activeWorkout.caloriesBurn || 300
          }}
          onComplete={handleCompleteWorkout}
          onCancel={onCancelWorkout}
        />
      )}
    </div>
  );
};

// This needs to be imported at the top, but I've moved it here to avoid circular dependencies
import WorkoutSession from '../WorkoutSession';

export default WorkoutCompleteHandler;
