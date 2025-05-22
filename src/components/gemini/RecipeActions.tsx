
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import useSounds from "@/hooks/useSounds";

interface RecipeActionsProps {
  recipeId?: string;
  isRecipeSaved: boolean;
  onAddRecipe: () => void;
  onDeleteRecipe: (id: string) => void;
}

const RecipeActions: React.FC<RecipeActionsProps> = ({ 
  recipeId, 
  isRecipeSaved, 
  onAddRecipe, 
  onDeleteRecipe 
}) => {
  const { toast } = useToast();
  const sounds = useSounds();
  
  const handleDelete = async () => {
    if (!recipeId) return;
    
    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      onDeleteRecipe(recipeId);
      
      // Play success sound
      if (sounds.isLoaded.success) {
        sounds.play('success', { volume: 0.5 });
      }

      toast({
        title: "Recipe deleted",
        description: "The recipe has been removed from your collection",
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      
      // Play failure sound
      if (sounds.isLoaded.failure) {
        sounds.play('failure', { volume: 0.5 });
      }
      
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="border-t border-green-200 bg-green-100 p-2">
      {!isRecipeSaved && (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={onAddRecipe}
        >
          Add to Nutrition
        </Button>
      )}
      
      {isRecipeSaved && recipeId && (
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Recipe
        </Button>
      )}
    </div>
  );
};

export default RecipeActions;
