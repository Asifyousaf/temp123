
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Calendar, LineChart, Dumbbell } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  const [aiWorkouts, setAIWorkouts] = useState<any[]>([]);
  const navigate = useNavigate();

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
      if (!session?.user?.id) throw new Error("No user session");
      const { error } = await supabase.from('workouts').insert({
        user_id: session.user.id,
        title: workoutData.title,
        type: workoutData.type,
        duration: workoutData.duration,
        calories_burned: workoutData.calories_burned,
        date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      toast({
        title: "Workout Completed",
        description: "Your workout has been recorded successfully!",
      });
      setActiveWorkout(null);
      setActiveView('history');
      await fetchUserWorkouts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workout data",
        variant: "destructive"
      });
    }
  };

  const handleStartWorkout = (workout: any, isAI = false) => {
    // Defensive: Ensure workout has exercises array
    if (isAI && (!workout.exercises || workout.exercises.length === 0)) {
      workout.exercises = [
        {
          name: "Jumping Jacks",
          sets: 3,
          reps: 15,
          duration: 60,
          restTime: 30,
          instructions: [
            "Start with feet together and arms at sides",
            "Jump and spread feet, raise arms overhead",
            "Jump back to start position",
            "Repeat"
          ]
        }
      ];
    }
    setActiveWorkout({ ...workout, isAI });
    setActiveView('active-workout');
  };

  useEffect(() => {
    // Ensure AI workouts include exercises arrays to avoid no exercises error
    setAIWorkouts([
      {
        id: 'ai-1',
        title: 'AI Generated Full Body Routine',
        type: 'Strength Training',
        duration: 30,
        calories_burned: 250,
        exercises: [
          {
            name: "Push-ups",
            sets: 3,
            reps: 12,
            duration: 60,
            restTime: 30,
            instructions: [
              "Start in plank position with arms straight",
              "Lower body until chest nearly touches floor",
              "Push back up",
              "Keep body straight"
            ]
          },
          {
            name: "Air Squats",
            sets: 3,
            reps: 15,
            duration: 60,
            restTime: 30,
            instructions: [
              "Stand feet shoulder-width apart",
              "Push hips back and bend knees",
              "Lower thighs parallel to floor",
              "Push through heels to stand"
            ]
          }
        ]
      },
      {
        id: 'ai-2',
        title: 'AI Cardio Blast',
        type: 'Cardio',
        duration: 20,
        calories_burned: 220,
        exercises: [
          {
            name: "Mountain Climbers",
            sets: 3,
            reps: 20,
            duration: 60,
            restTime: 30,
            instructions: [
              "Start in plank position",
              "Drive knees alternately to chest quickly"
            ]
          }
        ]
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
