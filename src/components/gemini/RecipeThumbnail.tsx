
import React from "react";
import type { Recipe } from "@/types/recipe";

interface RecipeThumbnailProps {
  recipe: Recipe;
}

const RecipeThumbnail: React.FC<RecipeThumbnailProps> = ({ recipe }) => {
  // Default image for recipes
  const defaultImage = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="px-4 pb-2">
      <div className="flex items-center gap-3">
        <img
          src={recipe.image || defaultImage}
          alt={recipe.title}
          className="h-16 w-16 object-cover rounded shadow-sm"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />
        <div>
          <div className="font-medium text-sm">{recipe.title}</div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {recipe.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="bg-green-100 px-1.5 py-0.5 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Show preview of ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-green-800">Ingredients:</div>
          <div className="text-xs text-green-700 line-clamp-2">
            {recipe.ingredients.slice(0, 3).join(', ')}
            {recipe.ingredients.length > 3 ? '...' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeThumbnail;
