
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          return;
        }
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        // Check if user is admin (email matches asif1@gmail.com)
        if (currentUser?.email === 'asif1@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        // Fetch profile data if user is logged in
        if (currentUser) {
          setIsLoading(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            console.log('Profile data fetched:', data);
            setProfile(data);
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setProfile(null);
        }
      } catch (err) {
        console.error('Unexpected error in getUser:', err);
        setIsLoading(false);
      }
    };
    
    getUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // First update the session state synchronously
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      // Check if user is admin
      if (currentUser?.email === 'asif1@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      // Then fetch additional data if user is present
      if (currentUser) {
        setIsLoading(true);
        
        // Fetch profile data directly without using setTimeout
        const fetchProfileData = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile on auth change:', error);
            } else if (data) {
              console.log('Profile data updated:', data);
              setProfile(data);
            } else {
              setProfile(null);
            }
            
            setIsLoading(false);
          } catch (err) {
            console.error('Error in auth change profile fetch:', err);
            setIsLoading(false);
          }
        };
        
        fetchProfileData();
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <header 
      className={`fixed w-full z-10 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-lg font-bold text-purple-600">NutriBuddy</Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Home</Link>
          <Link to="/workouts" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Workouts</Link>
          <Link to="/workout-tracker" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Tracker</Link>
          <Link to="/nutrition" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Nutrition</Link>
          <Link to="/mindfulness" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Mindfulness</Link>
          <Link to="/community" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Community</Link>
          <Link to="/store" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Store</Link>
          <Link to="/subscription" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">Subscription</Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-visible">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Profile" />
                    ) : (
                      <AvatarFallback className={`${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {getInitials(user.email || '')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700" onClick={toggleMenu}>
          {menuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu - Updated with smooth animations */}
      <div 
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      >
        <div 
          className={`bg-white absolute top-0 right-0 h-full w-3/4 max-w-sm shadow-lg transition-transform duration-300 ease-in-out transform ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <span className="font-bold text-lg text-purple-600">Menu</span>
            <button className="text-gray-500" onClick={closeMenu}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="py-4 px-5 flex flex-col space-y-4">
            <Link to="/" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Home</Link>
            <Link to="/workouts" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Workouts</Link>
            <Link to="/workout-tracker" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Tracker</Link>
            <Link to="/nutrition" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Nutrition</Link>
            <Link to="/mindfulness" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Mindfulness</Link>
            <Link to="/community" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Community</Link>
            <Link to="/store" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Store</Link>
            <Link to="/subscription" className="px-4 py-2 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Subscription</Link>
            
            {user ? (
              <>
                <div className="border-t border-gray-200 pt-4 mt-2"></div>
                <div className="flex items-center px-4 py-2">
                  <Avatar className="h-10 w-10 mr-3">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Profile" />
                    ) : (
                      <AvatarFallback className={`${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {getInitials(user.email || '')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile?.username || user.email}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" className="px-4 py-2 hover:bg-gray-50 rounded-md flex items-center" onClick={closeMenu}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </Link>
                <button 
                  className="px-4 py-2 hover:bg-gray-50 rounded-md flex items-center text-red-600 w-full text-left"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="bg-purple-600 text-white px-4 py-2 rounded-md text-center hover:bg-purple-700 transition-colors" onClick={closeMenu}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
