
import React from 'react';
import { Message } from './GeminiChat';
import GeminiMessageItem from './GeminiMessageItem';
import WorkoutPreview from './WorkoutPreview';
import RecipePreview from './RecipePreview';

interface GeminiMessageListProps {
  messages: Message[];
  isLoading: boolean;
  onAddWorkout?: (workout: any) => void;
  onSaveRecipe?: (recipe: any) => void;
}

const GeminiMessageList: React.FC<GeminiMessageListProps> = ({ 
  messages, 
  isLoading, 
  onAddWorkout,
  onSaveRecipe 
}) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          <GeminiMessageItem message={message} />
          {message.workoutData && message.workoutData.length > 0 && (
            <WorkoutPreview 
              workoutData={message.workoutData} 
              onAddWorkout={onAddWorkout}
            />
          )}
          {message.recipeData && message.recipeData.length > 0 && (
            <RecipePreview 
              recipeData={message.recipeData} 
              onSaveRecipe={onSaveRecipe}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default GeminiMessageList;
