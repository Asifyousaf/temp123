
import React from 'react';
import { Clock, Flame, Activity, Dumbbell } from 'lucide-react';
import { formatTime } from '@/utils/timeUtils';

interface WorkoutStatsProps {
  totalTimeElapsed: number;
  caloriesBurn: number;
  duration: number;
}

const WorkoutStats: React.FC<WorkoutStatsProps> = ({
  totalTimeElapsed,
  caloriesBurn,
  duration
}) => {
  // Default values if missing
  const safeCalories = caloriesBurn || 300;
  const safeDuration = duration || 30;
  const safeTimeElapsed = Math.max(0, totalTimeElapsed);
  
  // Calculate estimated calories based on time elapsed and total duration
  // Cap calories at the max defined by caloriesBurn
  const estimatedCalories = Math.min(
    Math.round((safeCalories * (safeTimeElapsed / 60) / safeDuration) || 0),
    safeCalories
  );
  
  // Calculate completion percentage
  const completionPercentage = Math.min(100, Math.round((safeTimeElapsed / 60 / safeDuration) * 100));
  
  // Estimate remaining time
  const remainingMinutes = Math.max(0, Math.round(safeDuration - (safeTimeElapsed / 60)));

  return (
    <div className="bg-purple-50 rounded-lg p-4">
      <h4 className="font-semibold text-purple-800 mb-3">Workout Progress</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>Time</span>
          </div>
          <div className="font-bold text-lg">{formatTime(safeTimeElapsed)}</div>
        </div>
        
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Flame className="h-4 w-4 mr-1 text-orange-500" />
            <span>Calories</span>
          </div>
          <div className="font-bold text-lg">{estimatedCalories}</div>
        </div>
        
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Activity className="h-4 w-4 mr-1 text-green-500" />
            <span>Completion</span>
          </div>
          <div className="font-bold text-lg">{completionPercentage}%</div>
        </div>
        
        <div className="bg-white p-3 rounded-md shadow-sm">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Dumbbell className="h-4 w-4 mr-1 text-purple-500" />
            <span>Remaining</span>
          </div>
          <div className="font-bold text-lg">~{remainingMinutes} min</div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutStats;
