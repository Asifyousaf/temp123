
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, SkipForward, ChevronRight, Check, XCircle, Clock, Dumbbell, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration: number; // in seconds
  restTime: number; // in seconds
  instructions: string[];
}

interface WorkoutPlan {
  id: string;
  title: string;
  type: string;
  description: string;
  level: string;
  duration: number; // in minutes
  caloriesBurn: number;
  exercises: Exercise[];
}

interface WorkoutSessionProps {
  workout: WorkoutPlan;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Exercise illustrations
const exerciseImages = {
  "Jumping Jacks": "https://www.inspireusafoundation.org/wp-content/uploads/2022/11/jumping-jack-animation.gif",
  "Push-ups": "https://thumbs.gfycat.com/GlossySkinnyDuckbillcat-max-1mb.gif",
  "Air Squats": "https://thumbs.gfycat.com/UnlinedTerribleGermanshorthairedpointer-max-1mb.gif",
  "Plank": "https://flabfix.com/wp-content/uploads/2019/05/Plank.gif",
  "Russian Twists": "https://media1.tenor.com/m/8byDO_ANDxAAAAAC/exercise-russian-twist.gif",
  "Mountain Climbers": "https://thumbs.gfycat.com/PhonyFaithfulAstrangiacoral-max-1mb.gif",
  "Sun Salutation (Surya Namaskar)": "https://cdn.dribbble.com/users/2931468/screenshots/5720362/media/e87bb48393c8202ff31e10056bbb413c.gif",
  "Warrior II (Virabhadrasana II)": "https://cdn.dribbble.com/users/2106177/screenshots/6834350/warrior2_dr.gif",
  "Tree Pose (Vrksasana)": "https://www.yogadukaan.com/blog/wp-content/uploads/2023/04/Vrikshasana-basic-steps-benefits.gif",
  
  "default": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/jumping-jacks-benefits.gif"
};

const WorkoutSession = ({ workout, onComplete, onCancel }: WorkoutSessionProps) => {
  // Defensive: if exercises is missing or empty, default to empty array
  const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [completedExerciseDetails, setCompletedExerciseDetails] = useState<{[key: string]: boolean}>({});
  const [animateTimer, setAnimateTimer] = useState(false);
  const timerRef = useRef<any>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  // Get exercise image
  const getExerciseImage = (exerciseName: string) => {
    return exerciseImages[exerciseName] || exerciseImages.default;
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Animate timer when it reaches zero
            setAnimateTimer(true);
            setTimeout(() => setAnimateTimer(false), 1000);
            return 0;
          }
          return prev - 1;
        });
        
        setTotalTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  useEffect(() => {
    if (timeLeft === 0 && !isPaused && currentExercise) {
      if (isResting) {
        // Rest is over, move to next set or exercise
        setIsResting(false);
        
        if (currentSet < currentExercise.sets) {
          // Move to next set
          setCurrentSet(prev => prev + 1);
          setTimeLeft(currentExercise.duration);
        } else {
          // Move to next exercise
          handleNextExercise();
        }
      } else {
        // Exercise is over, start rest or move to next exercise
        if (currentSet < currentExercise.sets) {
          // Start rest between sets
          setIsResting(true);
          setTimeLeft(currentExercise.restTime);
        } else {
          // Move to next exercise
          handleNextExercise();
        }
      }
    }
  }, [timeLeft, isPaused, currentExercise, isResting]);

  useEffect(() => {
    // Initialize time for first exercise or when exercise changes
    resetExerciseTimer();
  }, [currentExerciseIndex]);

  const resetExerciseTimer = () => {
    if (currentExercise) {
      setTimeLeft(isResting ? currentExercise.restTime : currentExercise.duration);
    } else {
      setTimeLeft(0);
    }
  };

  const handlePlayPause = () => {
    setIsPaused(prev => !prev);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      // Mark current exercise as completed
      const exerciseName = currentExercise?.name || "";
      setCompletedExerciseDetails(prev => ({
        ...prev,
        [exerciseName]: true
      }));

      // Update completed exercises count
      setCompletedExercises(prev => prev + 1);

      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setIsPaused(true);
    } else {
      // Workout complete
      // Mark last exercise as completed if it's not already
      const exerciseName = currentExercise?.name || "";
      if (exerciseName && !completedExerciseDetails[exerciseName]) {
        setCompletedExerciseDetails(prev => ({
          ...prev,
          [exerciseName]: true
        }));
        setCompletedExercises(prev => prev + 1);
      }
      handleComplete();
    }
  };

  const handleCompleteExercise = () => {
    const exerciseName = currentExercise?.name || "";
    
    // Only mark as completed if not already completed
    if (exerciseName && !completedExerciseDetails[exerciseName]) {
      setCompletedExerciseDetails(prev => ({
        ...prev,
        [exerciseName]: true
      }));
      setCompletedExercises(prev => prev + 1);
    }
    
    // Move to next exercise
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setIsPaused(true);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const minutesSpent = Math.max(Math.round(totalTimeElapsed / 60), 1);

    const completionPercentage = totalExercises > 0 ? completedExercises / totalExercises : 0;
    const minCaloriePercentage = 0.3;

    const estimatedCalories = Math.round(
      workout.caloriesBurn * Math.max(
        completionPercentage,
        Math.min(minutesSpent / workout.duration, 1),
        minCaloriePercentage
      )
    );

    const workoutData = {
      title: workout.title,
      type: workout.type,
      duration: minutesSpent,
      calories_burned: estimatedCalories
    };

    toast({
      title: "Workout Complete!",
      description: `You burned approximately ${estimatedCalories} calories in ${minutesSpent} minutes.`,
    });

    onComplete(workoutData);
  };

  if (totalExercises === 0) {
    return (
      <Card className="w-full border-2 border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle>No Exercises Available</CardTitle>
          <CardDescription>This workout has no exercises. Please add exercises to begin the session.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No exercises found in this workout plan.</p>
          <div className="flex justify-center mt-6">
            <Button onClick={onCancel} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Dumbbell className="mr-2 h-5 w-5 text-purple-600" />
            {workout.title}
          </div>
          <span className="text-sm font-normal bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            {`${completedExercises}/${totalExercises} exercises`}
          </span>
        </CardTitle>
        <CardDescription>{workout.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Workout Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-100" />
        </div>

        {/* Current exercise */}
        {currentExerciseIndex < totalExercises && currentExercise ? (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-800">{currentExercise.name}</h3>
                <div className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  Set {currentSet} of {currentExercise.sets}
                </div>
              </div>

              {/* Exercise animation/image */}
              <div className="mb-6 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={getExerciseImage(currentExercise.name)} 
                  alt={currentExercise.name} 
                  className="w-full object-cover h-64"
                />
              </div>

              {/* Timer display */}
              <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    {isResting ? "Rest Time" : "Exercise Time"}
                  </p>
                  <div className={`text-4xl font-bold mb-4 transition-all ${animateTimer ? 'text-red-500 scale-110' : ''}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={handlePlayPause} 
                      variant="outline" 
                      size="icon"
                      className="h-14 w-14 rounded-full border-2 hover:bg-purple-50 transition-all duration-200"
                    >
                      {isPaused ? (
                        <Play className="h-6 w-6 text-purple-700" />
                      ) : (
                        <Pause className="h-6 w-6 text-purple-700" />
                      )}
                    </Button>
                    <Button 
                      onClick={() => {
                        if (!currentExercise) return;
                        if (isResting) {
                          setIsResting(false);
                          setTimeLeft(currentExercise.duration);
                        } else if (currentSet < currentExercise.sets) {
                          setIsResting(true);
                          setTimeLeft(currentExercise.restTime);
                          setCurrentSet(prev => prev + 1);
                        } else {
                          handleNextExercise();
                        }
                      }} 
                      variant="outline" 
                      size="icon"
                      className="h-14 w-14 rounded-full border-2 hover:bg-purple-50 transition-all duration-200"
                    >
                      <SkipForward className="h-6 w-6 text-purple-700" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-purple-800">Instructions:</h4>
                
                <Carousel className="w-full">
                  <CarouselContent>
                    {currentExercise.instructions.map((instruction, index) => (
                      <CarouselItem key={index} className="pl-1 md:basis-1/1">
                        <div className="p-4 border border-purple-100 rounded-lg bg-white">
                          <div className="flex items-start">
                            <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-gray-700">{instruction}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
              
              {/* Mark as Complete Button */}
              <div className="mt-6">
                <Button 
                  onClick={handleCompleteExercise}
                  className={`w-full ${completedExerciseDetails[currentExercise.name] 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  <Check className="mr-2 h-5 w-5" />
                  {completedExerciseDetails[currentExercise.name] ? 'Exercise Completed!' : 'Mark Exercise Complete'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-600" />
                <span className="text-gray-700 font-medium">Total time: {formatTime(totalTimeElapsed)}</span>
              </div>
              <div className="flex items-center">
                <Flame className="h-5 w-5 mr-2 text-orange-500" />
                <span className="text-gray-700 font-medium">
                  Est. calories: ~{Math.round(workout.caloriesBurn * (totalTimeElapsed / 60) / workout.duration)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-green-100 text-green-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Workout Complete!</h3>
            <p className="text-gray-600 mb-6">Great job on finishing your workout!</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-800">{Math.round(totalTimeElapsed / 60)}</div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
              <div className="h-10 border-r border-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">
                  ~{Math.round(workout.caloriesBurn * (totalTimeElapsed / 60) / workout.duration)}
                </div>
                <div className="text-sm text-gray-500">Calories</div>
              </div>
              <div className="h-10 border-r border-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{completedExercises}</div>
                <div className="text-sm text-gray-500">Exercises</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg">
        <Button variant="outline" onClick={onCancel} className="border-red-200 text-red-600 hover:bg-red-50">
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Workout
        </Button>
        {currentExerciseIndex >= totalExercises ? (
          <Button onClick={handleComplete} className="bg-purple-600 hover:bg-purple-700">
            <Check className="mr-2 h-4 w-4" />
            Complete Workout
          </Button>
        ) : (
          <Button onClick={handleNextExercise} variant="default" className="bg-purple-600 hover:bg-purple-700">
            Skip Exercise
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WorkoutSession;
