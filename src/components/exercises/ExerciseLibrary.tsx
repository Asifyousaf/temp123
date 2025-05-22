
import React, { useEffect, useState } from "react";
import { Exercise } from "@/types/exercise";
import { useApi } from "@/hooks/useApi";
import { fetchBodyParts, fetchExercisesByBodyPart, fetchExercises } from "@/services/api";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExerciseCard from "./ExerciseCard";

interface ExerciseLibraryProps {
  searchTerm?: string;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ searchTerm = "" }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  const { data: exercises, isLoading: isExercisesLoading, error: exercisesError } = 
    useApi(fetchExercises, []);
  
  const { data: bodyParts, isLoading: isBodyPartsLoading } = 
    useApi(fetchBodyParts, []);

  const { data: categoryExercises, isLoading: isCategoryLoading } = 
    useApi(() => selectedCategory !== "all" ? fetchExercisesByBodyPart(selectedCategory) : Promise.resolve([]), 
    [selectedCategory]);
  
  useEffect(() => {
    const filterExercises = () => {
      let results: Exercise[] = [];
      
      // Get the source based on category selection
      const source = selectedCategory === "all" ? exercises : categoryExercises;
      
      if (!source) return;
      
      // Filter by search term if provided
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        results = source.filter((exercise: Exercise) => 
          exercise.name?.toLowerCase().includes(term) ||
          exercise.bodyPart?.toLowerCase().includes(term) ||
          exercise.target?.toLowerCase().includes(term) ||
          exercise.equipment?.toLowerCase().includes(term)
        );
      } else {
        results = source;
      }
      
      setFilteredExercises(results || []);
    };
    
    filterExercises();
  }, [exercises, categoryExercises, selectedCategory, searchTerm]);

  const isLoading = isExercisesLoading || isBodyPartsLoading || isCategoryLoading;

  if (isLoading && !filteredExercises.length) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
        <span className="ml-3 text-lg text-gray-600">Loading exercises...</span>
      </div>
    );
  }

  if (exercisesError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading exercises. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      {bodyParts && bodyParts.length > 0 && (
        <Tabs defaultValue="all" className="mb-8">
          <div className="border-b">
            <TabsList className="overflow-x-auto flex-wrap h-auto py-2 bg-transparent">
              <TabsTrigger 
                value="all" 
                onClick={() => setSelectedCategory("all")}
                className={`mr-2 mb-2 ${selectedCategory === "all" ? "bg-purple-100 text-purple-800" : ""}`}
              >
                All
              </TabsTrigger>
              {bodyParts.map((part) => (
                <TabsTrigger
                  key={part}
                  value={part}
                  onClick={() => setSelectedCategory(part)}
                  className={`mr-2 mb-2 ${selectedCategory === part ? "bg-purple-100 text-purple-800" : ""}`}
                >
                  {part.charAt(0).toUpperCase() + part.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}

      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">
            {searchTerm 
              ? `No exercises found matching "${searchTerm}"`
              : "No exercises found in this category."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
