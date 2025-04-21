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
            <div>
              <RecipePreview
                recipeData={message.recipeData}
                onSaveRecipe={onSaveRecipe}
              />
              {onSaveRecipe && (
                <button
                  onClick={() => {
                    if (message.recipeData && message.recipeData.length > 0) {
                      onSaveRecipe(message.recipeData[0]);
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Save First Recipe
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GeminiMessageList;
