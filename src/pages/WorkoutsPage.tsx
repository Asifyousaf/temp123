import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Play, Filter, Search, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Layout from '../components/Layout';
import WorkoutSession from '../components/WorkoutSession';

const workoutPlans = [
  {
    id: "1",
    title: "Full Body HIIT Challenge",
    type: "HIIT",
    description: "High intensity interval training to build strength and endurance.",
    level: "beginner",
    duration: 30,
    caloriesBurn: 300,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    exercises: [
      {
        name: "Jumping Jacks",
        sets: 3,
        reps: 20,
        duration: 60,
        restTime: 30,
        instructions: [
          "Start with your feet together and arms at your sides",
          "Jump up and spread your feet beyond shoulder-width while bringing your arms above your head",
          "Jump again to return to the starting position",
          "Repeat for the specified number of reps"
        ]
      },
      {
        name: "Push-ups",
        sets: 3,
        reps: 10,
        duration: 60,
        restTime: 30,
        instructions: [
          "Start in a plank position with your hands shoulder-width apart",
          "Lower your body until your chest nearly touches the floor",
          "Push yourself back up to the starting position",
          "Keep your body in a straight line throughout the movement"
        ]
      },
      {
        name: "Air Squats",
        sets: 3,
        reps: 15,
        duration: 60,
        restTime: 30,
        instructions: [
          "Stand with feet shoulder-width apart",
          "Push your hips back and bend your knees as if sitting in a chair",
          "Lower until your thighs are parallel to the ground",
          "Push through your heels to return to starting position"
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Core Focus & Strength",
    type: "CORE",
    description: "Build a strong core with this targeted workout routine.",
    level: "intermediate",
    duration: 25,
    caloriesBurn: 200,
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    exercises: [
      {
        name: "Plank",
        sets: 3,
        reps: 1,
        duration: 45,
        restTime: 30,
        instructions: [
          "Start in a push-up position but with your weight on your forearms",
          "Keep your body in a straight line from head to heels",
          "Engage your core and hold the position",
          "Breathe normally and maintain good form"
        ]
      },
      {
        name: "Russian Twists",
        sets: 3,
        reps: 15,
        duration: 60,
        restTime: 30,
        instructions: [
          "Sit on the floor with knees bent and feet lifted slightly",
          "Lean back slightly to engage your core",
          "Twist your torso from side to side",
          "Touch the floor beside your hips with each twist"
        ]
      },
      {
        name: "Mountain Climbers",
        sets: 3,
        reps: 20,
        duration: 60,
        restTime: 30,
        instructions: [
          "Start in a plank position with arms straight",
          "Bring one knee toward your chest",
          "Return it to the starting position while bringing the other knee forward",
          "Continue alternating at a quick pace"
        ]
      }
    ]
  },
  {
    id: "3",
    title: "Energizing Yoga Flow",
    type: "YOGA",
    description: "Increase flexibility and mindfulness with this yoga routine.",
    level: "all",
    duration: 45,
    caloriesBurn: 150,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    exercises: [
      {
        name: "Sun Salutation (Surya Namaskar)",
        sets: 3,
        reps: 1,
        duration: 120,
        restTime: 30,
        instructions: [
          "Start in mountain pose (Tadasana)",
          "Inhale, raise your arms overhead",
          "Exhale, fold forward",
          "Inhale, halfway lift",
          "Exhale, step or jump back to plank",
          "Lower to chaturanga",
          "Inhale to upward facing dog",
          "Exhale to downward facing dog",
          "Step forward and return to mountain pose"
        ]
      },
      {
        name: "Warrior II (Virabhadrasana II)",
        sets: 2,
        reps: 1,
        duration: 60,
        restTime: 20,
        instructions: [
          "Step your feet wide apart",
          "Turn your right foot out 90 degrees and left foot in slightly",
          "Extend your arms parallel to the floor",
          "Bend your right knee over your ankle",
          "Gaze over your right fingertips",
          "Hold and breathe deeply",
          "Repeat on the other side"
        ]
      },
      {
        name: "Tree Pose (Vrksasana)",
        sets: 2,
        reps: 1,
        duration: 60,
        restTime: 20,
        instructions: [
          "Start standing with feet together",
          "Shift your weight to one foot",
          "Place the sole of your other foot on your inner thigh",
          "Bring your hands to prayer position or extend overhead",
          "Focus your gaze on a fixed point",
          "Hold and breathe deeply",
          "Repeat on the other side"
        ]
      }
    ]
  }
];

const WorkoutsPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleStartWorkout = (workout) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start a workout session",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setActiveWorkout(workout);
  };

  const handleCompleteWorkout = async (workoutData) => {
    try {
      if (!session) return;

      if (!workoutData.exercises || !Array.isArray(workoutData.exercises) || workoutData.exercises.length === 0) {
        toast({
          title: "Workout Data Missing",
          description: "No exercises found in this workout plan.",
          variant: "destructive"
        });
        return;
      }

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
        description: "Your workout has been logged successfully!",
      });
      
      setActiveWorkout(null);
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

  const filteredWorkouts = workoutPlans.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || workout.level === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-purple-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (activeWorkout) {
    return (
      <Layout>
        <div className="pt-24 pb-16 bg-white">
          <div className="container mx-auto px-4">
            <button 
              onClick={() => setActiveWorkout(null)} 
              className="flex items-center text-purple-600 mb-6 hover:text-purple-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workouts
            </button>
            
            <WorkoutSession 
              workout={activeWorkout}
              onComplete={handleCompleteWorkout}
              onCancel={() => setActiveWorkout(null)}
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Personalized Workout Plans</h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            AI-powered workouts tailored to your fitness level, goals, and preferences.
          </p>
          <button 
            onClick={() => handleStartWorkout(workoutPlans[0])}
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center"
          >
            <Play size={18} className="mr-2" />
            Start Your First Workout
          </button>
        </div>
      </div>

      <div className="bg-white py-6 border-b">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <button className="flex items-center text-sm text-gray-700 mr-4">
              <Filter size={16} className="mr-1" />
              Filter
            </button>
            <div className="flex border rounded-lg overflow-hidden">
              <button 
                className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 text-sm ${filter === 'beginner' ? 'bg-purple-600 text-white' : ''}`}
                onClick={() => setFilter('beginner')}
              >
                Beginner
              </button>
              <button 
                className={`px-4 py-2 text-sm ${filter === 'intermediate' ? 'bg-purple-600 text-white' : ''}`}
                onClick={() => setFilter('intermediate')}
              >
                Intermediate
              </button>
              <button 
                className={`px-4 py-2 text-sm ${filter === 'advanced' ? 'bg-purple-600 text-white' : ''}`}
                onClick={() => setFilter('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search workouts..." 
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Recommended Workouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <div key={workout.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-300">
                  <img 
                    src={workout.image} 
                    alt={workout.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white rounded-full px-3 py-1 text-xs flex items-center">
                    <Clock size={12} className="mr-1" />
                    {workout.duration} min
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-xs text-purple-600 font-semibold mb-1">
                    <Dumbbell size={14} className="mr-1" />
                    {workout.type}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{workout.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{workout.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`
                        ${workout.level === 'beginner' ? 'bg-green-100 text-green-800' : 
                          workout.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'} 
                        text-xs px-2 py-1 rounded-full`}
                      >
                        {workout.level === 'all' ? 'All Levels' : 
                          workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}
                      </div>
                    </div>
                    <button 
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      onClick={() => handleStartWorkout(workout)}
                    >
                      Start →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkouts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No workouts found matching your search.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-full hover:bg-purple-50 transition-colors">
              View All Workouts
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkoutsPage;
