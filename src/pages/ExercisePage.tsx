
import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { fetchExercises } from '@/services/api';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

const ExercisesPage = () => {
  const { data: exercises, isLoading, error } = useApi(fetchExercises);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBodyPart, setFilterBodyPart] = useState('');
  
  // Get unique body parts for filter dropdown
  const bodyParts = exercises ? 
    Array.from(new Set(exercises.map((exercise: any) => exercise.bodyPart))) 
    : [];
  
  // Filter exercises based on search and bodyPart filter
  const filteredExercises = exercises ? 
    exercises.filter((exercise: any) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesBodyPart = !filterBodyPart || exercise.bodyPart === filterBodyPart;
      
      return matchesSearch && matchesBodyPart;
    }) : [];

  // Add console logging to debug GIF URLs
  if (exercises && exercises.length > 0) {
    console.log('First exercise data:', exercises[0]);
    console.log('First exercise GIF URL:', exercises[0].gifUrl);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Exercise Library</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="w-full md:w-2/3">
            <Input 
              placeholder="Search exercises by name, target muscle, or equipment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-1/3">
            <Select value={filterBodyPart} onValueChange={setFilterBodyPart}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by body part" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All body parts</SelectItem>
                {bodyParts.map((bodyPart: string) => (
                  <SelectItem key={bodyPart} value={bodyPart}>
                    {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {filterBodyPart && (
            <Button variant="outline" onClick={() => setFilterBodyPart('')}>
              Clear filters
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-lg text-gray-600">Loading exercises...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <p>Error loading exercises: {error.message}</p>
            <p className="text-sm mt-2">Please try again later or contact support if the issue persists.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-gray-600">
              {filteredExercises.length} exercises found
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredExercises.map((exercise: any) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
            
            {filteredExercises.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No exercises found matching your criteria.</p>
                <Button 
                  variant="link" 
                  className="mt-2" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBodyPart('');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ExercisesPage;
