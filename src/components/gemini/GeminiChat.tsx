import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, X, Volume2, VolumeX, Info, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import useSounds from '@/hooks/useSounds';
import { SoundType } from '@/types/sound';
import GeminiMessageList from './GeminiMessageList';
import GeminiChatInput from './GeminiChatInput';
import GeminiSuggestions from './GeminiSuggestions';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  workoutData?: any[];
  recipeData?: any[];
  dataType?: 'exercise' | 'recipe' | null;
}

interface GeminiChatProps {
  visible?: boolean;
  onClose?: () => void;
}

const CHAT_HISTORY_KEY = 'gemini_chat_history';

const GeminiChat: React.FC<GeminiChatProps> = ({ visible = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(visible);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([
    {
      id: '0',
      content: "Hi there! I'm your wellness assistant. How can I help you with workouts, nutrition, or mindfulness today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  
  const { play, isLoaded } = useSounds();

  useEffect(() => {
    const loadConversation = () => {
      try {
        const savedConversation = sessionStorage.getItem(CHAT_HISTORY_KEY);
        if (savedConversation) {
          const parsedConversation = JSON.parse(savedConversation).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setConversation(parsedConversation);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadConversation();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHAT_HISTORY_KEY && event.newValue) {
        try {
          const parsedConversation = JSON.parse(event.newValue).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setConversation(parsedConversation);
        } catch (error) {
          console.error('Error parsing chat history from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (conversation.length > 1) {
      try {
        sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(conversation));
        
        // Count user messages for free usage limit
        if (!isPremium && !isAdmin) {
          const userMsgCount = conversation.filter(msg => msg.sender === 'user').length;
          setFreeUsageCount(userMsgCount);
        }
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [conversation, isPremium, isAdmin]);

  useEffect(() => {
    setIsOpen(visible);
  }, [visible]);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        // Check if admin
        if (currentUser.email === 'asif1@gmail.com') {
          setIsAdmin(true);
          setIsPremium(true);
        } else {
          // Check subscription status from database
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('active', true)
            .maybeSingle();
          
          if (subscription && !error) {
            setIsPremium(true);
          } else {
            setIsPremium(false);
          }
        }
      }
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      
      if (!session?.user) {
        resetChat();
        setIsPremium(false);
        setIsAdmin(false);
      } else if (session.user.email === 'asif1@gmail.com') {
        setIsAdmin(true);
        setIsPremium(true);
      } else {
        // Check subscription status again
        const checkSubscription = async () => {
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('active', true)
            .maybeSingle();
            
          setIsPremium(!!subscription && !error);
        };
        
        checkSubscription();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [conversation, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen && isLoaded.notification && isSoundEnabled) {
      play('notification', { volume: volume / 100 });
    }
    
    if (!newIsOpen && onClose) {
      onClose();
    }
  };

  const resetChat = () => {
    const initialMessage: Message = {
      id: '0',
      content: "Hi there! I'm your wellness assistant. How can I help you with workouts, nutrition, or mindfulness today?",
      sender: 'ai',
      timestamp: new Date()
    };
    
    setConversation([initialMessage]);
    sessionStorage.removeItem(CHAT_HISTORY_KEY);
    setFreeUsageCount(0);
    setShowSubscriptionPrompt(false);
    
    if (isSoundEnabled) {
      play('notification', { volume: volume / 100 });
    }
    
    toast({
      title: "Chat Reset",
      description: "Your conversation has been reset.",
    });
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const handleIncomingMessage = (query: string) => {
    if (query.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: query,
        sender: 'user',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, userMessage]);
      setIsOpen(true);
      handleGeminiResponse(query);
    }
  };

  const playSoundEffect = (type: SoundType) => {
    if (isLoaded[type] && isSoundEnabled) {
      play(type, { volume: volume / 100 });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Check free usage limit (if not premium/admin)
    if (!isPremium && !isAdmin && freeUsageCount >= 4) {
      setShowSubscriptionPrompt(true);
      playSoundEffect('notification');
      return;
    }

    const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date()
    };

    setConversation([...conversation, userMessage]);
    setMessage('');
    
    playSoundEffect('beep');
    
    handleGeminiResponse(message);
  };

  const handleGeminiResponse = async (userMessage: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-wellness-chatbot', {
        body: { 
          message: userMessage,
          history: conversation.slice(-5).map(msg => ({ 
            role: msg.sender === 'user' ? 'user' : 'model', 
            parts: msg.content 
          }))
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      playSoundEffect('success');
      
      // Detect recipe and workout terms
      const hasRecipeTerms = userMessage.toLowerCase().includes('recipe') || 
                             userMessage.toLowerCase().includes('meal') || 
                             userMessage.toLowerCase().includes('food') || 
                             userMessage.toLowerCase().includes('eat') ||
                             userMessage.toLowerCase().includes('cook');
      
      const hasWorkoutTerms = userMessage.toLowerCase().includes('workout') || 
                             userMessage.toLowerCase().includes('exercise') || 
                             userMessage.toLowerCase().includes('training') ||
                             userMessage.toLowerCase().includes('fitness');
                             
      let dataType = null;
      if (data.workoutData && data.workoutData.length > 0) {
        dataType = 'exercise';
      } else if (data.recipeData && data.recipeData.length > 0) {
        dataType = 'recipe';
      } else if (hasRecipeTerms) {
        dataType = 'recipe';
      } else if (hasWorkoutTerms) {
        dataType = 'exercise';
      }
      
      let workoutData = data.workoutData || [];
      let recipeData = data.recipeData || [];
      
      if (dataType === 'recipe' && recipeData.length === 0) {
        recipeData = [{
          title: "AI Generated Recipe",
          summary: "Recipe details extracted from chat",
          calories: 300,
          protein: 25,
          carbs: 40, 
          fat: 15,
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          diets: ["Balanced"],
          readyInMinutes: 30,
          servings: 2
        }];
      }
      
      if (dataType === 'exercise' && workoutData.length === 0 && hasWorkoutTerms) {
        workoutData = [{
          name: "Custom Exercise",
          type: "CUSTOM",
          sets: 3,
          reps: 12,
          duration: 60,
          restTime: 30,
          calories_burned: 300,
          instructions: ["Perform the exercise with proper form", "Maintain controlled movements"]
        }];
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'ai',
        timestamp: new Date(),
        workoutData: workoutData,
        recipeData: recipeData,
        dataType: dataType
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      // Check free usage limit after response
      if (!isPremium && !isAdmin) {
        const newCount = freeUsageCount + 1;
        setFreeUsageCount(newCount);
        
        // Show subscription prompt when approaching limit
        if (newCount >= 3 && newCount < 4) {
          const limitMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: "You're approaching your free usage limit. Consider subscribing to our premium plan for unlimited AI assistance!",
            sender: 'ai',
            timestamp: new Date(),
          };
          
          setConversation(prev => [...prev, limitMessage]);
        } else if (newCount >= 4) {
          setShowSubscriptionPrompt(true);
        }
      }
      
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      playSoundEffect('failure');
      
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to Gemini. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWorkout = async (workout: any) => {
    try {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save workout plans",
          variant: "default",
        });
        return;
      }

      console.log("Saving workout to Supabase:", workout);

      let workoutData: any = {
        user_id: user.id,
        title: workout.title || "Custom Workout",
        type: workout.type || "General",
        duration: workout.duration || 30,
        calories_burned: workout.calories_burned || 300,
        date: new Date().toISOString().split('T')[0]
      };

      if (workout.isWorkoutPack && workout.originalWorkouts) {
        workoutData.exercises = JSON.stringify(workout.exercises || []);
        workoutData.is_pack = true;
        workoutData.pack_items = JSON.stringify(workout.originalWorkouts);
      } else {
        workoutData.exercises = typeof workout.exercises === 'string' 
          ? workout.exercises 
          : JSON.stringify(workout.exercises || []);
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutData);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      playSoundEffect('success');
      
      toast({
        title: workout.isWorkoutPack ? "Workout Pack Added" : "Workout Added",
        description: `The workout ${workout.isWorkoutPack ? 'pack' : ''} has been added to your workout plan`,
      });
      
      navigate('/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      playSoundEffect('failure');
      
      toast({
        title: "Error",
        description: "Failed to add workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveRecipe = async (recipe: any) => {
    try {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save recipes",
          variant: "default",
        });
        return;
      }

      console.log("Recipe being saved:", recipe);

      const recipeId = recipe.id && recipe.id.toString().startsWith('recipe-') 
        ? recipe.id 
        : `recipe-${Date.now()}`;

      const recipeData = {
        user_id: user.id,
        food_name: recipe.title || "AI Generated Recipe",
        calories: recipe.calories || 300,
        protein: recipe.protein || 25,
        carbs: recipe.carbs || 40,
        fat: recipe.fat || 15,
        meal_type: "recipe",
        date: new Date().toISOString().split('T')[0],
        recipe_details: {
          image: recipe.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
          time: recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "20 min",
          servings: recipe.servings || 2,
          description: recipe.summary || "AI-generated recipe",
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
          tags: Array.isArray(recipe.tags) ? recipe.tags : ["AI Generated"],
        }
      };

      console.log("Final recipe data being inserted:", recipeData);

      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert(recipeData);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      playSoundEffect('success');
      
      toast({
        title: "Recipe Saved",
        description: "The recipe has been saved to your nutrition collection",
      });
      
      navigate('/nutrition');
    } catch (error) {
      console.error('Error saving recipe:', error);
      playSoundEffect('failure');
      
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  React.useEffect(() => {
    if (window) {
      (window as any).geminiChatRef = {
        handleIncomingMessage
      };
    }
    return () => {
      if (window) {
        delete (window as any).geminiChatRef;
      }
    };
  }, [conversation]);

  return (
    <>
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-full p-3 shadow-lg hover:bg-purple-700 transition-all hover:shadow-xl z-50"
        aria-label="Open chat support"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 bg-white rounded-xl shadow-2xl w-[90vw] sm:w-[400px] max-h-[600px] flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-xl">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-white">
                  <AvatarImage src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_256px.webp" />
                  <AvatarFallback className="bg-purple-200 text-purple-800">AI</AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <h3 className="font-semibold text-lg">Gemini Wellness</h3>
                  {(isPremium || isAdmin) && (
                    <Badge className="ml-2 bg-yellow-500 text-xs">Premium</Badge>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 text-white hover:bg-purple-700">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">How can I help you?</h4>
                        <p className="text-sm text-gray-500">Ask me about:</p>
                        <ul className="text-sm text-gray-500 list-disc list-inside">
                          <li>Personalized workout plans</li>
                          <li>Nutrition advice and recipes</li>
                          <li>Fitness equipment recommendations</li>
                          <li>Exercise modifications</li>
                          <li>Wellness tips</li>
                        </ul>
                        <p className="text-sm mt-2 font-medium">Try these prompts:</p>
                        <ul className="text-sm text-gray-500 list-disc list-inside">
                          <li>Create a HIIT workout for my legs</li>
                          <li>Give me a high-protein breakfast recipe</li>
                          <li>What should I eat after a workout?</li>
                        </ul>
                        {!isPremium && !isAdmin && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-amber-600">Free users get 4 free AI chat responses</p>
                            <p className="text-xs text-gray-500">
                              {4 - freeUsageCount} responses remaining
                            </p>
                          </div>
                        )}
                        <div className="pt-2 border-t mt-2">
                          <p className="text-xs text-gray-500">Powered by Google Gemini AI with ExerciseDB and Spoonacular APIs</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={resetChat}
                  className="text-white hover:bg-purple-700 mr-1"
                  title="Reset conversation"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={toggleSound}
                  className="text-white hover:bg-purple-700 mr-1"
                  title={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
                >
                  {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleChat} 
                  className="text-white hover:bg-purple-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <AnimatePresence>
              {isSoundEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-50 border-b overflow-hidden"
                >
                  <div className="p-3 flex items-center">
                    <Slider
                      value={[volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 ml-2 w-8">{volume}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                <GeminiMessageList 
                  messages={conversation} 
                  isLoading={isLoading}
                  onAddWorkout={handleAddWorkout}
                  onSaveRecipe={handleSaveRecipe} 
                />
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-lg rounded-bl-none max-w-[80%] px-4 py-2 shadow-sm">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600 mr-2" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {showSubscriptionPrompt && !isPremium && !isAdmin && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-100">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-purple-800">You've reached your free usage limit</h4>
                  <p className="text-xs text-gray-600 mt-1 mb-3">
                    Subscribe to our premium plan for unlimited AI assistance and workout plans
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    size="sm"
                    onClick={() => {
                      navigate('/subscription');
                      toggleChat();
                    }}
                  >
                    View Subscription Plans
                  </Button>
                </div>
              </div>
            )}
            
            {conversation.length < 3 && (
              <GeminiSuggestions onSelectSuggestion={handleSelectSuggestion} />
            )}
            
            <GeminiChatInput 
              message={message}
              setMessage={setMessage}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              userSignedIn={!!user}
              disabled={showSubscriptionPrompt && !isPremium && !isAdmin}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiChat;
