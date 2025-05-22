
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";

interface RecipeDetailsProps {
  recipe: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: (id: string) => void;
  isAlreadySaved: boolean;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ 
  recipe,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isAlreadySaved 
}) => {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe.title}</DialogTitle>
        </DialogHeader>
        
        {recipe.image && (
          <div className="w-full h-48 md:h-64 mb-4">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
              }}
            />
          </div>
        )}
        
        {/* Nutrition Info */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Calories</p>
            <p className="font-medium">{recipe.calories || recipe.nutrition?.calories || 'N/A'}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Protein</p>
            <p className="font-medium">{recipe.protein || recipe.nutrition?.protein || 'N/A'}g</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Carbs</p>
            <p className="font-medium">{recipe.carbs || recipe.nutrition?.carbs || 'N/A'}g</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Fat</p>
            <p className="font-medium">{recipe.fat || recipe.nutrition?.fat || 'N/A'}g</p>
          </div>
        </div>
        
        {/* Summary if available */}
        {recipe.summary && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Summary</h3>
            <div 
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: recipe.summary }}
            />
          </div>
        )}
        
        {/* Ingredients */}
        {(recipe.ingredients && recipe.ingredients.length > 0) && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Ingredients</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Instructions */}
        {(recipe.instructions && recipe.instructions.length > 0) && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Instructions</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600">
              {recipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className="mb-2">{instruction}</li>
              ))}
            </ol>
          </div>
        )}
        
        <DialogFooter className="flex justify-between gap-2 mt-4">
          {onDelete && recipe.id && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                onDelete(recipe.id);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}
          
          {onSave && !isAlreadySaved && (
            <Button onClick={() => {
              onSave();
              onClose();
            }}>
              <Heart className="h-4 w-4 mr-1" /> Save Recipe
            </Button>
          )}
          
          {isAlreadySaved && (
            <p className="text-sm text-green-600 italic">Recipe saved to your collection</p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetails;
