
import React from 'react';
import { WorkoutData } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Clock, Flame } from 'lucide-react';

interface WorkoutHeaderProps {
  onStartFirstWorkout: (workout: WorkoutData) => void;
  firstWorkout: WorkoutData;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ onStartFirstWorkout, firstWorkout }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64 bg-gray-300">
        <img 
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2340&q=80" 
          alt="Featured Workout" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{firstWorkout.title}</h2>
          <p className="mb-4 line-clamp-2">{firstWorkout.description}</p>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{firstWorkout.duration} min</span>
            </div>
            <div className="flex items-center">
              <Flame className="h-4 w-4 mr-1" />
              <span>{firstWorkout.caloriesBurn || firstWorkout.calories_burned} calories</span>
            </div>
            <div className="px-2 py-1 bg-purple-600 bg-opacity-70 rounded-full text-xs">
              {firstWorkout.type}
            </div>
          </div>
          
          <Button 
            onClick={() => onStartFirstWorkout(firstWorkout)}
            className="bg-white text-purple-700 hover:bg-gray-100"
          >
            Start Workout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutHeader;
