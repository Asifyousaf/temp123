import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Clock, Heart, Beef, Apple, Egg, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RecipeDetails from '@/components/RecipeDetails';

interface RecipePreviewProps {
  recipeData: any[];
  onSaveRecipe?: (recipe: any) => void;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  recipeId?: string;
}

const RecipePreview: React.FC<RecipePreviewProps> = ({ 
  recipeData, 
  onSaveRecipe, 
  showDelete,
  onDelete,
  recipeId 
}) => {
  const { toast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  if (!recipeData || recipeData.length === 0) return null;
  
  const handleSaveRecipe = (recipe: any) => {
    if (onSaveRecipe) {
      // Make sure all required fields are present with the same structure as workout data
      const enrichedRecipe = {
        id: recipe.id || `recipe-${Date.now()}`,
        title: recipe.title || "AI Generated Recipe",
        calories: recipe.nutrition?.calories || recipe.calories || 300,
        protein: recipe.nutrition?.protein || recipe.protein || 25,
        carbs: recipe.nutrition?.carbs || recipe.carbs || 40,
        fat: recipe.nutrition?.fat || recipe.fat || 15,
        image: recipe.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        servings: recipe.servings || 2,
        summary: recipe.summary || "AI-generated recipe",
        ingredients: Array.isArray(recipe.extendedIngredients) 
          ? recipe.extendedIngredients.map((ing: any) => ing.original) 
          : Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.analyzedInstructions?.[0]?.steps) 
          ? recipe.analyzedInstructions[0].steps.map((step: any) => step.step) 
          : Array.isArray(recipe.instructions) ? recipe.instructions : [],
        tags: Array.isArray(recipe.diets) ? recipe.diets : 
              Array.isArray(recipe.tags) ? recipe.tags : ["AI Generated"]
      };
      
      console.log("RecipePreview: Enriched recipe before saving:", enrichedRecipe);
      onSaveRecipe(enrichedRecipe);
    }
  };

  const handleDelete = async () => {
    if (!recipeId) return;

    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      toast({
        title: "Recipe deleted",
        description: "The recipe has been removed from your collection",
      });

      if (onDelete) {
        onDelete(recipeId);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsDetailsOpen(true);
  };
  
  const recipe = recipeData[0];
  const recipeDetails = recipe.recipe_details ? 
    (typeof recipe.recipe_details === 'string' ? JSON.parse(recipe.recipe_details) : recipe.recipe_details) 
    : null;
  
  return (
    <div className="mt-4">
      <Card className="border border-green-200">
        <CardHeader className="bg-green-50 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <Utensils className="w-4 h-4 mr-2" /> 
              Recipe Details
            </CardTitle>
            {showDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <div className="flex gap-3">
            {(recipe.image || (recipeDetails && recipeDetails.image)) && (
              <div className="w-20 h-20 flex-shrink-0">
                <img 
                  src={recipe.image || recipeDetails?.image} 
                  alt={recipe.title}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium text-sm">{recipe.title || recipe.food_name}</h4>
              
              {(recipeDetails?.time || recipe.readyInMinutes) && (
                <div className="flex items-center text-xs text-gray-600 mt-2">
                  <Clock className="w-3 h-3 mr-1" /> 
                  {recipeDetails?.time || `${recipe.readyInMinutes} min`}
                </div>
              )}
              
              {(recipeDetails?.servings || recipe.servings) && (
                <div className="text-xs text-gray-600">
                  Serves: {recipeDetails?.servings || recipe.servings}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Beef className="w-3 h-3 mr-1 text-red-500" /> 
                  {recipe.protein}g
                </div>
                <div className="flex items-center">
                  <Apple className="w-3 h-3 mr-1 text-green-500" /> 
                  {recipe.carbs}g
                </div>
                <div className="flex items-center">
                  <Egg className="w-3 h-3 mr-1 text-yellow-500" /> 
                  {recipe.fat}g
                </div>
              </div>
              
              {((recipeDetails?.tags && recipeDetails.tags.length > 0) || 
                (recipe.tags && recipe.tags.length > 0)) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(recipeDetails?.tags || recipe.tags).slice(0, 2).map((tag: string, i: number) => (
                    <span key={i} className="bg-green-100 px-1.5 py-0.5 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {(recipeDetails?.tags || recipe.tags).length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{(recipeDetails?.tags || recipe.tags).length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Show summary if available with HTML rendering */}
          {((recipe.summary) && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Summary:</h5>
              <div 
                className="text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: recipe.summary }}
              />
            </div>
          ))}

          {/* Show ingredients if available */}
          {((recipeDetails?.ingredients && recipeDetails.ingredients.length > 0) ||
            (recipe.ingredients && recipe.ingredients.length > 0)) && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Ingredients:</h5>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {(recipeDetails?.ingredients || recipe.ingredients).map((ingredient: string, index: number) => (
                  <li key={index} className="text-sm">{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Show instructions if available */}
          {((recipeDetails?.instructions && recipeDetails.instructions.length > 0) ||
            (recipe.instructions && recipe.instructions.length > 0)) && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Instructions:</h5>
              <ol className="list-decimal list-inside text-sm text-gray-600">
                {(recipeDetails?.instructions || recipe.instructions).map((instruction: string, index: number) => (
                  <li key={index} className="text-sm">{instruction}</li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 pt-2 flex justify-between gap-2">
          {onSaveRecipe && (
            <Button 
              onClick={() => handleSaveRecipe(recipe)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Heart className="h-4 w-4 mr-1" />
              Save Recipe
            </Button>
          )}
          <Button 
            onClick={() => handleViewRecipe(recipe)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
      
      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onSave={onSaveRecipe ? () => handleSaveRecipe(selectedRecipe) : undefined}
          isAlreadySaved={false}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default RecipePreview;
