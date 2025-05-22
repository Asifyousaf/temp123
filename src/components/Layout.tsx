
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign out",
        variant: "destructive"
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center text-xl font-bold text-purple-600">
            <Dumbbell className="mr-2" />
            Workout Tracker
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/workouts" className="text-gray-700 hover:text-purple-600">Workouts</Link>
            
            {session ? (
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Sign Out
              </Button>
            ) : (
              <Button 
                variant="default"
                onClick={() => navigate('/auth')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link 
                to="/workouts" 
                className="text-gray-700 hover:text-purple-600 py-2"
                onClick={closeMenu}
              >
                Workouts
              </Link>
              
              {session ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 w-full"
                >
                  Sign Out
                </Button>
              ) : (
                <Button 
                  variant="default"
                  onClick={() => {
                    navigate('/auth');
                    closeMenu();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Simplified Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-xl font-bold mb-4 md:mb-0">
              <Dumbbell className="mr-2" />
              Workout Tracker
            </div>
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Workout Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
