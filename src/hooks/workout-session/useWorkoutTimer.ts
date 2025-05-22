
import { useState, useEffect, useRef } from 'react';

export const useWorkoutTimer = (
  isPaused: boolean, 
  setTimeLeft: (value: React.SetStateAction<number>) => void, 
  setTotalTimeElapsed: (value: React.SetStateAction<number>) => void,
  setAnimateTimer: (value: React.SetStateAction<boolean>) => void
) => {
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
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
  }, [isPaused, setTimeLeft, setTotalTimeElapsed, setAnimateTimer]);
};
