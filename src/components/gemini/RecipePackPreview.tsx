
import React from "react";
import { isDefaultRecipe, isDuplicateInMessage } from "@/utils/recipeUtils";
import RecipeSummary from "./RecipeSummary";
import RecipeThumbnail from "./RecipeThumbnail";
import RecipeActions from "./RecipeActions";
import type { Recipe } from "@/types/recipe";

interface RecipePackPreviewProps {
  recipes: Recipe[];
  onAddRecipe?: (recipes: Recipe[]) => void;
  onDeleteRecipe?: (id: string) => void;
  savedRecipeIds?: string[];
}

const RecipePackPreview: React.FC<RecipePackPreviewProps> = ({ 
  recipes, 
  onAddRecipe,
  onDeleteRecipe,
  savedRecipeIds = []
}) => {
  if (!recipes?.length) return null;

  // Get the primary recipe
  const recipe = recipes[0];
  
  // Add default image if missing
  if (!recipe.image) {
    recipe.image = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  }
  
  // Check if primary recipe is saved
  const isRecipeSaved = recipe?.id && savedRecipeIds.includes(recipe.id);
  
  // Skip rendering if this is the default recipe and there's already a JSON-extracted recipe
  if (isDefaultRecipe(recipe, recipes) && isDuplicateInMessage(recipe)) {
    return null;
  }
  
  const handleAddRecipe = () => {
    if (onAddRecipe) {
      // Ensure all recipes have images
      const recipesWithImages = recipes.map(r => ({
        ...r, 
        image: r.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }));
      onAddRecipe(recipesWithImages);
    }
  };

  return (
    <div 
      className="bg-green-50 border border-green-200 rounded-lg mb-2 shadow-sm overflow-hidden recipe-preview" 
      data-recipe-id={recipe.id}
    >
      <RecipeSummary recipe={recipe} recipes={recipes} />
      <RecipeThumbnail recipe={recipe} />
      <RecipeActions 
        recipeId={recipe.id} 
        isRecipeSaved={isRecipeSaved} 
        onAddRecipe={handleAddRecipe} 
        onDeleteRecipe={onDeleteRecipe || (() => {})} 
      />
    </div>
  );
};

export default RecipePackPreview;
