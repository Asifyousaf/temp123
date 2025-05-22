
import React, { useEffect, useState } from 'react';
import { Pause } from 'lucide-react';

interface TimerDisplayProps {
  timeLeft: number;
  isPaused: boolean;
  isRest: boolean;
  animate?: boolean;
  onTimeEnd?: () => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeLeft, 
  isPaused, 
  isRest,
  animate = false,
  onTimeEnd 
}) => {
  // Convert seconds to minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Format display with leading zeros
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Trigger onTimeEnd when time reaches zero
  useEffect(() => {
    if (timeLeft === 0 && onTimeEnd) {
      setTimeout(() => {
        onTimeEnd();
      }, 300);
    }
  }, [timeLeft, onTimeEnd]);
  
  // Animation classes based on time remaining
  const getAnimationClasses = () => {
    if (timeLeft <= 3) return 'animate-pulse scale-110 text-red-600';
    if (timeLeft <= 10) return 'animate-pulse text-orange-600';
    if (animate) return 'scale-110 transition-transform';
    return '';
  };
  
  const timerColor = isRest ? 
    'border-blue-400 dark:border-blue-600' : 
    'border-purple-500 dark:border-purple-700';
    
  const textColor = isRest ? 
    'text-blue-600 dark:text-blue-400' : 
    'text-purple-700 dark:text-purple-400'; 
  
  return (
    <div className={`relative w-36 h-36 rounded-full border-4 flex items-center justify-center shadow-md ${timerColor}`}>
      {isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
          <Pause className="h-12 w-12 text-gray-700 opacity-60" />
        </div>
      )}
      
      <div className="text-center">
        <div className={`text-5xl font-bold ${textColor} ${getAnimationClasses()}`}>
          {formattedTime}
        </div>
        <div className="text-sm text-gray-500 mt-1 font-medium">
          {isRest ? 'Rest' : 'Work'}
        </div>
      </div>
      
      {/* Circular progress indicator */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle 
          cx="50" cy="50" r="46" 
          fill="none" 
          stroke="#f3f4f6" 
          strokeWidth="4" 
          strokeDasharray="289.02652413026095" 
          strokeDashoffset="0"
          className="opacity-40"
        />
        <circle 
          cx="50" cy="50" r="46" 
          fill="none" 
          stroke={isRest ? "#3b82f6" : "#8b5cf6"} 
          strokeWidth="4" 
          strokeDasharray="289.02652413026095" 
          strokeDashoffset={289.02652413026095 * (1 - timeLeft / (isRest ? 60 : 60))}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
    </div>
  );
};

export default TimerDisplay;
