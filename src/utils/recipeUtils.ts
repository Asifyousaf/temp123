
import { Recipe } from "@/types/recipe";

// Calculate total calories from recipe nutrition data
export const calculateTotalCalories = (recipes: Recipe[]): number => {
  return recipes.reduce(
    (sum, recipe) => sum + (recipe.nutrition?.calories || recipe.calories || 0),
    0
  ) || 300;
};

// Calculate total preparation time
export const calculatePreparationTime = (recipes: Recipe[]): number => {
  return recipes.reduce(
    (sum, recipe) => sum + (recipe.readyInMinutes || 15),
    0
  );
};

// Check if a recipe is the default AI-generated one with minimal details
export const isDefaultRecipe = (recipe: Recipe, recipes: Recipe[]): boolean => {
  return recipe.title === "AI Generated Recipe" && !recipe.ingredients?.length && recipes.length === 1;
};

// Check if a recipe appears to be a duplicate in the message
export const isDuplicateInMessage = (recipe: Recipe): boolean => {
  if (!recipe.messageId) return false;
  
  const parentElement = document.querySelector(`[data-message-id="${recipe.messageId}"]`);
  if (parentElement && parentElement.querySelectorAll('.recipe-preview').length > 1) {
    return true;
  }
  return false;
};
