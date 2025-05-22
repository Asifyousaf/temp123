
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { WorkoutData } from '@/types/workout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Flame, Trophy, ArrowLeft } from 'lucide-react';

interface WorkoutCompleteHandlerProps {
  activeWorkout: WorkoutData;
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
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteWorkout = async () => {
    try {
      setIsCompleting(true);
      
      if (!session?.user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your workout",
          variant: "destructive"
        });
        return;
      }

      const workoutData = {
        user_id: session.user.id,
        title: activeWorkout.title,
        type: activeWorkout.type || 'General',
        duration: activeWorkout.duration,
        calories_burned: activeWorkout.caloriesBurn || activeWorkout.calories_burned || 300,
        exercises: activeWorkout.exercises || [],
        date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase.from('workouts').insert(workoutData);

      if (error) throw error;
      
      toast({
        title: "Workout Completed",
        description: `Great job! Burned ${workoutData.calories_burned} calories in ${workoutData.duration} minutes.`,
      });
      
      onCompleteWorkout(workoutData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save your workout",
        variant: "destructive"
      });
      console.error('Error saving workout:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <button 
        onClick={onCancelWorkout} 
        className="flex items-center text-purple-600 mb-6 hover:text-purple-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Workouts
      </button>
      
      <Card className="mb-8">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-purple-600" />
            Complete Your Workout
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{activeWorkout.title}</h2>
            <p className="text-gray-600 mb-4">{activeWorkout.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-purple-600 mr-1" />
                <span>{activeWorkout.duration} minutes</span>
              </div>
              <div className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
                <Flame className="h-4 w-4 text-orange-500 mr-1" />
                <span>{activeWorkout.caloriesBurn || activeWorkout.calories_burned || 300} calories</span>
              </div>
              <div className="bg-blue-50 px-3 py-1 rounded-full">
                {activeWorkout.type || 'General'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleCompleteWorkout}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isCompleting}
            >
              {isCompleting ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Workout
                </>
              )}
            </Button>
            
            <Button
              onClick={onCancelWorkout}
              variant="outline"
              className="flex-1"
              disabled={isCompleting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutCompleteHandler;
