
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { WorkoutData } from '@/types/workout';
import { supabase } from "@/integrations/supabase/client";

interface AuthRequiredHandlerProps {
  session: any;
  onStartWorkout: (workout: WorkoutData) => void;
}

const AuthRequiredHandler = ({ session, onStartWorkout }: AuthRequiredHandlerProps) => {
  const navigate = useNavigate();

  const handleStartWorkout = async (workout: WorkoutData) => {
    // Double-check current session status
    const { data } = await supabase.auth.getSession();
    
    if (!session && !data.session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start a workout session",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    // Ensure workout has an image
    if (!workout.image || workout.image === '') {
      workout.image = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2340&q=80";
    }
    
    onStartWorkout(workout);
  };

  return { handleStartWorkout };
};

export default AuthRequiredHandler;
