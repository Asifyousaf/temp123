
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Mail, Lock, User } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all fields');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email for verification instructions",
      });
      
      // Redirect user
      if (data?.session) {
        navigate('/');
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }
      
      // Sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });
      
      navigate('/');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="pt-24 flex-grow flex items-center justify-center bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-2">
                <Dumbbell size={40} className="text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold">Welcome to Workout Tracker</h1>
              <p className="text-gray-600">Sign in or create an account to get started</p>
            </div>

            <Card>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your email and password to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="email"
                          type="email" 
                          placeholder="you@example.com" 
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={handleSignIn}
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="register">
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Enter your details to create a new account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="full-name" 
                          type="text" 
                          placeholder="John Doe" 
                          className="pl-10"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="email-register" 
                          type="email" 
                          placeholder="you@example.com" 
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="password-register" 
                          type="password" 
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={handleSignUp}
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
