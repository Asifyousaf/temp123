
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  filter, 
  setFilter 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="md:w-1/4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workouts</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="custom">My Workouts</SelectItem>
            <SelectItem value="pack">Workout Packs</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchAndFilter;
