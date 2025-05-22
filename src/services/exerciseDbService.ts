
import { toast } from "@/components/ui/use-toast";

// ExerciseDB API configuration - Using RapidAPI
const EXERCISEDB_RAPIDAPI_URL = "https://exercisedb.p.rapidapi.com";
// For free version fallback
const EXERCISEDB_API_URL = "https://exercisedb-api.vercel.app";


const RAPIDAPI_KEY = "3258340256msh72616f62a5d431dp1207f6jsnc6934870cc0b"; // Replace with your key

// Custom types for ExerciseDB API responses
export interface ExerciseDbExercise {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

/**
 * Fetches exercise data from ExerciseDB API
 * @param endpoint The API endpoint to fetch from
 * @param params Additional query parameters
 * @returns The response data or null if the request fails
 */
export const fetchExerciseDb = async (
  endpoint: string,
  params: Record<string, string> = {}
): Promise<any> => {
  try {
    console.log("Fetching from ExerciseDB API:", endpoint);
    
    // Try RapidAPI first if key is provided
    if (RAPIDAPI_KEY && RAPIDAPI_KEY !== "3258340256msh72616f62a5d431dp1207f6jsnc6934870cc0b") {
      try {
        const response = await fetch(`${EXERCISEDB_RAPIDAPI_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          cache: 'force-cache' // Add caching to improve performance and reduce API calls
        });

        if (response.ok) {
          const data = await response.json();
          return convertHttpToHttps(data);
        }
        
        console.log("RapidAPI request failed, falling back to free API");
      } catch (error) {
        console.error("RapidAPI request failed:", error);
        console.log("Falling back to free API");
      }
    }
    
    // Fallback to free API version
    const queryString = new URLSearchParams(params).toString();
    const url = `${EXERCISEDB_API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    console.log("Making API request to:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'force-cache', // Add caching to improve performance
      mode: 'cors'
    });

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return convertHttpToHttps(data);
  } catch (error) {
    console.error("ExerciseDB API request failed:", error);
    return null;
  }
};

/**
 * Converts all HTTP URLs to HTTPS in the API response
 */
const convertHttpToHttps = (data: any): any => {
  if (!data) return data;
  
  // Convert http to https for all GIF URLs
  if (Array.isArray(data)) {
    return data.map(item => {
      if (item && item.gifUrl) {
        item.gifUrl = item.gifUrl.replace(/^http:\/\//i, 'https://');
      }
      return item;
    });
  } else if (data && data.gifUrl) {
    data.gifUrl = data.gifUrl.replace(/^http:\/\//i, 'https://');
    return data;
  }
  return data;
};

// Cache for exercise data to reduce API calls
const exerciseCache: Record<string, ExerciseDbExercise | null> = {};

/**
 * Gets the best matching exercise from the ExerciseDB API with caching
 * @param exerciseName Name of the exercise to search for
 * @returns Best matching exercise or null if none found
 */
export const getBestMatchingExercise = async (exerciseName: string): Promise<ExerciseDbExercise | null> => {
  // Check cache first
  const cacheKey = exerciseName.toLowerCase().trim();
  if (exerciseCache[cacheKey] !== undefined) {
    console.log("Using cached exercise data for:", exerciseName);
    return exerciseCache[cacheKey];
  }

  try {
    console.log("Searching for exercise:", exerciseName);
    const exercises = await fetchExerciseDb(`/exercises/name/${encodeURIComponent(exerciseName.toLowerCase())}`);
    
    if (!exercises || exercises.length === 0) {
      console.log("No exercises found for:", exerciseName);
      exerciseCache[cacheKey] = null;
      return null;
    }
    
    // Find exact match first
    let bestMatch = exercises.find((ex: ExerciseDbExercise) => 
      ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
    
    // If no exact match, use the first result
    if (!bestMatch) {
      bestMatch = exercises[0];
    }
    
    console.log("Found best match for", exerciseName, ":", bestMatch.name);
    
    // Store in cache
    exerciseCache[cacheKey] = bestMatch;
    return bestMatch;
  } catch (error) {
    console.error("Failed to get best matching exercise:", error);
    exerciseCache[cacheKey] = null;
    return null;
  }
};

// Additional helper functions can be implemented as needed

/**
 * Gets exercise by its ID
 * @param id Exercise ID
 * @returns Exercise data or null if the request fails
 */
export const getExerciseById = async (id: string): Promise<ExerciseDbExercise | null> => {
  try {
    return await fetchExerciseDb(`/exercises/exercise/${id}`);
  } catch (error) {
    console.error("Failed to get exercise by ID:", error);
    return null;
  }
};
