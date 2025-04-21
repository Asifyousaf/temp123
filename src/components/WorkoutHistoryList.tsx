
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Flame, Dumbbell, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Workout {
  id: string;
  title: string;
  type: string;
  duration: number;
  calories_burned: number;
  date: string;
  created_at: string;
}

interface WorkoutHistoryListProps {
  userId: string;
}

const WorkoutHistoryList = ({ userId }: WorkoutHistoryListProps) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId);
      
      if (filter !== 'all') {
        query = query.eq('type', filter);
      }
      
      if (sortOrder === 'newest') {
        query = query.order('date', { ascending: false });
      } else {
        query = query.order('date', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setWorkouts(data || []);
    } catch (error: any) {
      console.error('Error fetching workouts:', error.message);
      toast({
        title: "Error",
        description: "Failed to load workout history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [userId, filter, sortOrder]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Workout deleted successfully"
      });
      
      fetchWorkouts();
    } catch (error: any) {
      console.error('Error deleting workout:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive"
      });
    }
  };

  const workoutTypes = ["all", "Strength Training", "Cardio", "HIIT", "Yoga", "Pilates", "CrossFit", "Running", "Cycling", "Swimming", "Bodyweight", "Stretching", "Other"];

  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-purple-600" />
            Workout History
          </CardTitle>
          <CardDescription>View and manage your past workouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium block mb-1">Filter by Type</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium block mb-1">Sort Order</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-purple-600">Loading...</div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Dumbbell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium mb-1">No workouts found</p>
              <p>Start logging your workouts to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <Card key={workout.id} className="overflow-hidden bg-gray-50 border-gray-100">
                  <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Dumbbell className="mr-2 h-4 w-4 text-purple-500" />
                        <h3 className="font-medium">{workout.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(parseISO(workout.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {workout.duration} minutes
                        </div>
                        <div className="flex items-center">
                          <Flame className="mr-1 h-3 w-3" />
                          {workout.calories_burned} calories
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                          {workout.type}
                        </span>
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Workout</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this workout? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(workout.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutHistoryList;
