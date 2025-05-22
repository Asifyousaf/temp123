
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutData } from '@/types/workout';

interface WorkoutPackTabsProps {
  isWorkoutPack: boolean;
  isAIGeneratedPack: boolean;
  activePackItemIndex: number;
  packItems: WorkoutData[] | undefined;
  exercises: any[];
  onValueChange: (value: string) => void;
}

const WorkoutPackTabs: React.FC<WorkoutPackTabsProps> = ({
  isWorkoutPack,
  isAIGeneratedPack,
  activePackItemIndex,
  packItems,
  exercises,
  onValueChange
}) => {
  if (!isWorkoutPack && !isAIGeneratedPack) return null;
  
  const tabItems = isWorkoutPack && packItems ? 
    packItems : 
    exercises.map((ex, i) => ({ title: ex.name, id: i }));
  
  return (
    <Tabs 
      defaultValue={activePackItemIndex.toString()} 
      onValueChange={onValueChange}
      className="w-full mb-6"
    >
      <TabsList className="w-full flex overflow-x-auto">
        {tabItems.map((packItem, index) => (
          <TabsTrigger 
            key={index} 
            value={index.toString()}
            className="flex-1 min-w-20"
          >
            {packItem.title && packItem.title.length > 15 ? `${packItem.title.slice(0, 15)}...` : packItem.title || packItem.name || `Workout ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default WorkoutPackTabs;
