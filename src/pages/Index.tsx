
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import Layout from '../components/Layout';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check for user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleStartJourney = () => {
    if (session) {
      navigate('/workouts');
    } else {
      toast({
        title: "Sign in required",
        description: "Please sign in to start your fitness journey",
        variant: "default",
      });
      navigate('/auth');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Workout Tracker</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Your personalized journey to fitness starts here. Check out our workout plans.
          </p>
          <Button 
            onClick={handleStartJourney}
            className="bg-white text-purple-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center mx-auto"
          >
            <Dumbbell size={18} className="mr-2" />
            View Workouts
          </Button>
        </div>
      </section>

      {/* Feature Card */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-400 rounded-lg p-6 text-white shadow-lg col-span-1 md:col-span-3">
              <div className="mb-4">
                <Dumbbell className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Workouts</h3>
              <p className="mb-4">Personalized fitness routines that adapt to you</p>
              <Link to="/workouts" className="bg-white text-blue-500 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors inline-block">
                Explore Workouts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
