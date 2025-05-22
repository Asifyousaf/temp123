
import React from "react";
import { Exercise } from "@/types/exercise";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Array of fallback images if the main image fails to load
  const fallbackImages = [
    "https://media1.tenor.com/m/ATlOy9HYgLMAAAAC/push-ups.gif",
    "https://media1.tenor.com/m/2nEQqqxUb5wAAAAC/jumping-jacks-workout.gif",
    "https://media1.tenor.com/m/swrtW4dXlYAAAAAC/lunge-exercise.gif",
    "https://media1.tenor.com/m/U7OXlvYxaTIAAAAC/squats.gif",
    "https://media1.tenor.com/m/ZC-WH4unx7YAAAAd/burpees-exercise.gif"
  ];

  // Choose a fallback image based on some property of the exercise
  const getFallbackImage = () => {
    // Use the first character of the exercise name to select a fallback image
    const index = exercise.name.charCodeAt(0) % fallbackImages.length;
    return fallbackImages[index];
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        
        <img
          src={exercise.gifUrl}
          alt={`${exercise.name} demonstration`}
          className={`w-full h-full object-cover ${imageLoaded && !imageError ? 'block' : 'hidden'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
            console.error(`Failed to load image for exercise: ${exercise.name} with URL: ${exercise.gifUrl}`);
          }}
        />
        
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            <img
              src={getFallbackImage()}
              alt={`${exercise.name} demonstration (fallback)`}
              className="w-full h-full object-cover"
              onError={() => {
                console.error(`Fallback image error for: ${exercise.name}`);
              }}
            />
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">{exercise.name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            {exercise.bodyPart}
          </Badge>
          
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
            {exercise.target}
          </Badge>
          
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            {exercise.equipment}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 text-sm text-gray-500">
        <p>ID: {exercise.id}</p>
      </CardFooter>
    </Card>
  );
};

export default ExerciseCard;
