
// Fix Workout tab to reload workouts after adding and split rendered sections for user-added and AI workouts with timers and start buttons

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Calendar, ArrowRight, LineChart, Dumbbell, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import WorkoutForm from '../components/WorkoutForm';
import WorkoutHistoryList from '../components/WorkoutHistoryList';
import WorkoutStats from '../components/WorkoutStats';
import WorkoutSession from '../components/WorkoutSession';
import WorkoutList from '../components/WorkoutList';

const WorkoutTrackerPage = () => {
  const [session, setSession] = useState<any>(null);
  const [activeView, setActiveView] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
  const [aiWorkouts, setAIWorkouts] = useState<any[]>([]); // For AI generated workouts with timers
  const navigate = useNavigate();

  // Fetch user session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if no session after load
  useEffect(() => {
    if (!isLoading && !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the workout tracker.",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  // Fetch user workouts from supabase
  const fetchUserWorkouts = useCallback(async () => {
    if (!session?.user?.id) {
      setUserWorkouts([]);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setUserWorkouts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load workouts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUserWorkouts();
  }, [fetchUserWorkouts]);

  const handleWorkoutComplete = async (workoutData: any) => {
    try {
      const { error } = await supabase.from('workouts').insert({
        user_id: session?.user?.id,
        title: workoutData.title,
        type: workoutData.type,
        duration: workoutData.duration,
        calories_burned: workoutData.calories_burned,
        date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;

      toast({
        title: "Workout Completed",
        description: "Your workout has been recorded successfully!",
      });

      setActiveWorkout(null);
      setActiveView('history');

      // Reload workouts immediately after adding to refresh UI
      if (fetchUserWorkouts) {
        await fetchUserWorkouts();
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workout data",
        variant: "destructive"
      });
    }
  };

  const handleStartWorkout = (workout: any, isAI = false) => {
    setActiveWorkout({ ...workout, isAI });
    setActiveView('active-workout');
  };

  // Dummy AI workouts for demonstration (would be dynamic in real app)
  useEffect(() => {
    // Example AI workouts (could be loaded from AI chat or backend)
    setAIWorkouts([
      {
        id: 'ai-1',
        title: 'AI Generated Full Body Routine',
        type: 'Strength Training',
        duration: 30,
        calories_burned: 250
      },
      {
        id: 'ai-2',
        title: 'AI Cardio Blast',
        type: 'Cardio',
        duration: 20,
        calories_burned: 220
      }
    ]);
  }, []);

  if (isLoading || !session) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-purple-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 bg-gradient-to-br from-purple-500 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Workout Tracker</h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            Log your workouts, track your progress, and achieve your fitness goals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!activeWorkout ? (
          <>
            <div className="flex flex-wrap mb-8 space-x-2">
              <Button 
                variant={activeView === 'summary' ? 'default' : 'outline'}
                onClick={() => setActiveView('summary')}
                className="mb-2"
              >
                <LineChart className="mr-2 h-4 w-4" /> Summary
              </Button>
              <Button 
                variant={activeView === 'log' ? 'default' : 'outline'}
                onClick={() => setActiveView('log')}
                className="mb-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Log Workout
              </Button>
              <Button 
                variant={activeView === 'history' ? 'default' : 'outline'}
                onClick={() => setActiveView('history')}
                className="mb-2"
              >
                <Calendar className="mr-2 h-4 w-4" /> Workout History
              </Button>
              <Button 
                variant={activeView === 'start-workout' ? 'default' : 'outline'}
                onClick={() => setActiveView('start-workout')}
                className="mb-2"
              >
                <Dumbbell className="mr-2 h-4 w-4" /> Start Workout
              </Button>
            </div>

            {activeView === 'summary' && (
              <>
                <div className="mb-6 space-y-6">
                  {/* User Workouts Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Dumbbell className="mr-2 h-5 w-5 text-purple-600" />
                        Your Workouts
                      </CardTitle>
                      <CardDescription>Workouts you have logged</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userWorkouts.length === 0 ? (
                        <p className="text-gray-600">No workouts logged yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {userWorkouts.map(workout => (
                            <li key={workout.id} className="flex justify-between items-center border-b border-gray-200 py-2">
                              <span>{workout.title} ({workout.type})</span>
                              <Button variant="outline" size="sm" onClick={() => handleStartWorkout(workout, false)}>
                                Start Workout
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Generated Workouts Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Dumbbell className="mr-2 h-5 w-5 text-purple-600" />
                        AI Suggested Workouts
                      </CardTitle>
                      <CardDescription>Workouts generated by AI</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aiWorkouts.length === 0 ? (
                        <p className="text-gray-600">No AI workouts available.</p>
                      ) : (
                        <ul className="space-y-2">
                          {aiWorkouts.map(workout => (
                            <li key={workout.id} className="flex justify-between items-center border-b border-gray-200 py-2">
                              <span>{workout.title} ({workout.type}) - {workout.duration} min</span>
                              <Button variant="outline" size="sm" onClick={() => handleStartWorkout(workout, true)}>
                                Start Workout
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <WorkoutStats userId={session.user.id} />
              </>
            )}

            {activeView === 'log' && <WorkoutForm userId={session.user.id} onSuccess={() => {
              setActiveView('history');
              fetchUserWorkouts();
            }} />}

            {activeView === 'history' && <WorkoutHistoryList userId={session.user.id} />}
            {activeView === 'start-workout' && <WorkoutList onSelectWorkout={handleStartWorkout} />}
          </>
        ) : (
          // Show active workout session
          <WorkoutSession 
            workout={activeWorkout} 
            onComplete={handleWorkoutComplete} 
            onCancel={() => setActiveWorkout(null)} 
          />
        )}
      </div>
    </Layout>
  );
};

export default WorkoutTrackerPage;

