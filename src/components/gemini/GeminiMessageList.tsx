import React, { useState } from 'react';
import { Message } from './GeminiChat';
import GeminiMessageItem from './GeminiMessageItem';
import WorkoutPreview from './WorkoutPreview';
import RecipePreview from './RecipePreview';
import RecipePackPreview from './RecipePackPreview';
import { useToast } from '@/hooks/use-toast';

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
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const { toast } = useToast();
  
  const handleAddWorkoutPack = (workouts: any[]) => {
    if (!onAddWorkout || !workouts.length) return;

    const formattedWorkouts = workouts.map(workout => ({
      title: workout.title || workout.name || "Untitled Exercise",
      type: workout.type || "CUSTOM",
      sets: workout.sets || 3,
      reps: workout.reps || 12,
      duration: workout.duration || 60,
      restTime: workout.restTime || 30,
      calories_burned: workout.calories_burned || 300,
      instructions: Array.isArray(workout.instructions) ? workout.instructions : 
        ["Perform the exercise with proper form", "Maintain controlled movements", "Focus on your breathing"],
      name: workout.name || workout.title || "Exercise"
    }));

    const workoutPack = {
      title: `AI Generated Pack (${workouts.length} workouts)`,
      type: "AI_PACK",
      description: "Custom workout pack created by AI assistant",
      level: "custom",
      duration: formattedWorkouts.reduce((total, w) => total + (w.duration || 30), 0),
      calories_burned: formattedWorkouts.reduce((total, w) => total + (w.calories_burned || 300), 0),
      caloriesBurn: formattedWorkouts.reduce((total, w) => total + (w.calories_burned || 300), 0),
      exercises: {
        isWorkoutPack: true,
        originalWorkouts: workouts,
        list: formattedWorkouts
      }
    };

    onAddWorkout(workoutPack);
  };

  const handleAddRecipePack = (recipes: any[]) => {
    if (!onSaveRecipe || !recipes.length) return;
    
    const recipe = recipes[0];
    
    let extractedRecipe = extractRecipeFromMessage(recipe);
    
    console.log("Extracted recipe data:", extractedRecipe);
    
    const recipeId = `recipe-${Date.now()}`;
    
    const formattedRecipe = {
      id: recipeId,
      title: extractedRecipe.title || "AI Generated Recipe",
      calories: extractedRecipe.calories || 300,
      protein: extractedRecipe.protein || 25,
      carbs: extractedRecipe.carbs || 40,
      fat: extractedRecipe.fat || 15,
      image: recipe.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      servings: extractedRecipe.servings || 2,
      summary: recipe.summary || "AI-generated recipe",
      ingredients: extractedRecipe.ingredients || [],
      instructions: extractedRecipe.instructions || [],
      readyInMinutes: recipe.readyInMinutes || 20,
      tags: extractedRecipe.tags || recipe.diets || ["AI Generated"],
      meal_type: "recipe"
    };
    
    console.log("Recipe Pack: Formatted recipe for saving:", formattedRecipe);
    onSaveRecipe(formattedRecipe);
    setSavedRecipeIds(prev => [...prev, recipeId]);
  };

  const extractRecipeFromMessage = (recipe: any): any => {
    let extractedData = {
      title: "AI Generated Recipe",
      ingredients: [],
      instructions: [],
      calories: 300,
      protein: 25,
      carbs: 40,
      fat: 15,
      tags: ["AI Generated"],
      servings: 2
    };
    
    try {
      if (recipe.title) {
        extractedData.title = recipe.title;
      }
      
      if (Array.isArray(recipe.ingredients)) {
        extractedData.ingredients = recipe.ingredients;
      }
      
      if (Array.isArray(recipe.instructions)) {
        extractedData.instructions = recipe.instructions;
      }
      
      if (recipe.calories) {
        extractedData.calories = recipe.calories;
      }
      
      if (recipe.protein) {
        extractedData.protein = recipe.protein;
      }
      
      if (recipe.carbs) {
        extractedData.carbs = recipe.carbs;
      }
      
      if (recipe.fat) {
        extractedData.fat = recipe.fat;
      }
      
      if (Array.isArray(recipe.tags)) {
        extractedData.tags = recipe.tags;
      }
      
      if (recipe.servings) {
        extractedData.servings = recipe.servings;
      }
    } catch (error) {
      console.error("Error extracting recipe data:", error);
    }
    
    return extractedData;
  };

  const handleRecipeDelete = (id: string) => {
    setSavedRecipeIds(prev => prev.filter(recipeId => recipeId !== id));
    toast({
      title: "Recipe deleted",
      description: "The recipe has been removed from your saved recipes"
    });
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        let extractedRecipeData = null;
        let recipeDataFromMessage = null;
        
        if (message.sender === 'ai') {
          recipeDataFromMessage = extractJSONFromMessage(message.content);
          if (recipeDataFromMessage) {
            extractedRecipeData = [recipeDataFromMessage];
          }
        }
        
        return (
          <div key={message.id}>
            <GeminiMessageItem message={message} />
            
            {((message.workoutData && Array.isArray(message.workoutData) && message.workoutData.length > 0) || 
              message.dataType === 'exercise') && (
              <div className="mt-2">
                <WorkoutPreview 
                  workoutData={message.workoutData || []} 
                  onAddWorkout={onAddWorkout}
                  onAddWorkoutPack={message.workoutData && message.workoutData.length > 1 ? handleAddWorkoutPack : undefined}
                />
              </div>
            )}
            
            {(extractedRecipeData || 
              (message.recipeData && Array.isArray(message.recipeData) && message.recipeData.length > 0) || 
              message.dataType === 'recipe') && (
              <div className="mt-2">
                <RecipePackPreview
                  recipes={extractedRecipeData || message.recipeData || [{
                    id: `recipe-${Date.now()}`,
                    title: "AI Generated Recipe",
                    summary: "Recipe extracted from the message",
                    calories: 300,
                    protein: 25,
                    carbs: 40,
                    fat: 15,
                    servings: 2,
                    ingredients: [],
                    instructions: [],
                    tags: ["AI Generated"],
                    messageId: message.id // Added message ID to help with duplicate detection
                  }]}
                  onAddRecipe={handleAddRecipePack}
                  onDeleteRecipe={handleRecipeDelete}
                  savedRecipeIds={savedRecipeIds}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const extractJSONFromMessage = (content: string): any | null => {
  try {
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const jsonData = JSON.parse(jsonStr);
      
      if (jsonData.title && 
          (jsonData.ingredients || jsonData.instructions || 
           jsonData.calories || jsonData.protein)) {
        return jsonData;
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing JSON from message:", error);
    return null;
  }
};

export default GeminiMessageList;
