
import React from "react";
import { Utensils } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { calculateTotalCalories, calculatePreparationTime } from "@/utils/recipeUtils";

interface RecipeSummaryProps {
  recipe: Recipe;
  recipes: Recipe[];
}

const RecipeSummary: React.FC<RecipeSummaryProps> = ({ recipe, recipes }) => {
  const totalCalories = calculateTotalCalories(recipes);
  const preparationTime = calculatePreparationTime(recipes);

  return (
    <div className="p-4 pb-2">
      <div className="font-semibold text-lg text-green-800 flex items-center gap-2">
        <Utensils className="w-5 h-5" /> 
        {recipe.title || "Recipe"}
        {recipes.length > 1 && (
          <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded text-xs ml-2">
            {recipes.length} recipes
          </span>
        )}
      </div>
      
      <div className="text-green-700 text-sm mb-2">
        {recipe.summary ? (
          <div 
            dangerouslySetInnerHTML={{ 
              __html: recipe.summary.length > 120 
                ? `${recipe.summary.substring(0, 120)}...` 
                : recipe.summary 
            }} 
          />
        ) : (
          recipe.ingredients && recipe.ingredients.length > 0 
            ? `${recipe.ingredients.length} ingredients, ready in ${preparationTime} mins` 
            : "Personalized recipe by AI assistant"
        )}
      </div>
      
      <div className="flex items-center space-x-5 text-xs text-green-700 mb-2">
        <span>Approx. {preparationTime} mins</span>
        <span>~{totalCalories} calories</span>
      </div>
    </div>
  );
};

export default RecipeSummary;
