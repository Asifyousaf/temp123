
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Users, Check, Flame } from 'lucide-react';

interface RecipeDetailsProps {
  recipe: {
    title: string;
    image: string;
    time: string;
    servings: number;
    calories: number;
    description: string;
    ingredients: string[];
    instructions: string[];
    tags: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex gap-4 text-white">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{recipe.time}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{recipe.servings} servings</span>
                </div>
                <div className="flex items-center">
                  <Flame className="h-4 w-4 mr-1" />
                  <span className="text-sm">{recipe.calories} kcal</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-600">{recipe.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 mt-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="bg-purple-100 text-purple-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetails;
