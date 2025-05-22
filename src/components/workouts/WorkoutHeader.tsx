
import React from 'react';
import { Play } from 'lucide-react';
import { WorkoutData } from '@/types/workout';

interface WorkoutHeaderProps {
  onStartFirstWorkout: (workout: WorkoutData) => void;
  firstWorkout: WorkoutData;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ onStartFirstWorkout, firstWorkout }) => {
  return (
    <div className="py-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-2xl font-bold mb-2">Personalized Workout Plans</h1>
        <p className="text-sm max-w-2xl mb-3">
          AI-powered workouts tailored to your fitness level, goals, and preferences.
        </p>
        <button 
          onClick={() => onStartFirstWorkout(firstWorkout)}
          className="bg-white text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center text-sm"
        >
          <Play size={14} className="mr-1" />
          Start Your First Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutHeader;
