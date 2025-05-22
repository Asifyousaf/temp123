
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ExerciseDemonstrationProps {
  exerciseName: string;
  imageUrl: string;
  currentSet: number;
  totalSets: number;
  isLoading?: boolean;
  onImageError?: () => void;
  compact?: boolean;
  youtubeId?: string;
}

const ExerciseDemonstration: React.FC<ExerciseDemonstrationProps> = ({ 
  exerciseName, 
  imageUrl, 
  currentSet,
  totalSets,
  isLoading = false,
  onImageError,
  compact = false,
  youtubeId
}) => {
  const [imgError, setImgError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Check if this is a rest period based on the exercise name
  const isRestPeriod = exerciseName === 'Rest Time';
  
  useEffect(() => {
    // Reset states when imageUrl changes
    if (imageUrl) {
      setImgError(false);
      setIsInitialLoad(true);
    }
  }, [imageUrl]);
  
  // Preload image to reduce flicker
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => setIsInitialLoad(false);
      img.onerror = () => {
        setImgError(true);
        setIsInitialLoad(false);
      };
    }
  }, [imageUrl]);
  
  const handleImageError = () => {
    if (!imgError) {
      console.log('Image error occurred for:', exerciseName);
      setImgError(true);
      if (onImageError) {
        onImageError();
      }
    }
  };
  
  const renderContent = () => {
    if (youtubeId) {
      return (
        <div className="relative w-full pb-[56.25%]">
          <iframe 
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&controls=1`}
            title={`${exerciseName} demonstration`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    if (isLoading || isInitialLoad) {
      return (
        <div className="w-full aspect-video flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-2" />
            <span className="text-sm text-gray-500">Loading exercise demonstration...</span>
          </div>
        </div>
      );
    }

    // For rest periods, display the rest image with special styling
    if (isRestPeriod) {
      return (
        <div className="w-full aspect-video flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg relative">
          <img 
            src={imageUrl}
            alt="Rest period" 
            className="w-full h-full object-cover" 
            loading="eager"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center p-4 bg-white/90 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-blue-700">Rest Time</h3>
              <p className="text-gray-700">Take a moment to recover</p>
            </div>
          </div>
        </div>
      );
    }

    if (imgError) {
      return (
        <div className="w-full aspect-video flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <p className="text-gray-500">No demonstration available for {exerciseName}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-video flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg">
        <img 
          src={imageUrl}
          alt={`${exerciseName} demonstration`} 
          className="max-w-full h-auto object-contain" 
          loading="eager"
          onError={handleImageError}
        />
      </div>
    );
  };
  
  return (
    <div className={`overflow-hidden rounded-lg bg-white ${compact ? 'min-h-[200px]' : ''}`}>
      <div className="relative bg-gray-100">
        {renderContent()}
        
        {!compact && !youtubeId && !isRestPeriod && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium truncate">{exerciseName}</h3>
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                Set {currentSet} of {totalSets}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseDemonstration;
