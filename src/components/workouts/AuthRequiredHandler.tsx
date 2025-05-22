
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkoutData } from '@/types/workout';
import { toast } from '@/components/ui/use-toast';

interface AuthRequiredHandlerProps {
  session: any;
  onStartWorkout: (workout: WorkoutData) => void;
}

const AuthRequiredHandler = ({ session, onStartWorkout }: AuthRequiredHandlerProps) => {
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleStartWorkout = (workout: WorkoutData) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start this workout",
        variant: "default"
      });
      setIsAuthenticating(true);
      navigate('/auth');
      return;
    }
    
    onStartWorkout(workout);
  };

  return { handleStartWorkout, isAuthenticating };
};

export default AuthRequiredHandler;
