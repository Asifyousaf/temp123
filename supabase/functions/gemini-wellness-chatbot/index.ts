
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get environment variables
const geminiApiKey = Deno.env.get("Gemini_1");
const exerciseDBApiKey = Deno.env.get('EXERCISEDB_API_KEY');
const spoonacularApiKey = Deno.env.get('SPOONACULAR_API_KEY');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for the Gemini AI
const systemPrompt = `
You are a certified personal trainer and nutritionist who helps users with workout plans, meal suggestions, and wellness tips.

IMPORTANT FORMATTING RULES:
1. Use plain text only. No markdown formatting.
2. Do not use * for bullets or any other special characters like --, ==, or ** for formatting.
3. Keep your responses conversational, clear, and concise.

When users ask about workouts:
- Tell them "Here's a workout plan for you. You can add it to your workout page."
- Keep exercise explanations simple and direct.
- Structure all workouts with a clear title, target muscles, and instructions.

When users ask about meals or recipes:
- Tell them "Here's a recipe you might enjoy. You can save it to your recipe collection."
- Include basic nutritional information when available.
- Structure all recipes with a clear title, ingredients, and instructions.

For all responses:
- Be friendly and supportive but keep it brief.
- Avoid overly technical language.
- Use short paragraphs with clear spacing.
- Never use bullet points with special characters.

Your goal is to provide helpful fitness and nutrition guidance in a clean, easy-to-read format that works well in a chat interface.
`;

// Function to detect if user is asking for workout information
function isWorkoutQuery(query: string): boolean {
  const workoutKeywords = ['workout', 'exercise', 'training', 'lift', 'cardio', 'strength', 'routine', 'fitness', 'muscle', 'gym'];
  return workoutKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Function to detect if user is asking for nutrition information
function isNutritionQuery(query: string): boolean {
  const nutritionKeywords = ['food', 'meal', 'recipe', 'diet', 'nutrition', 'eat', 'calorie', 'protein', 'carb', 'vegan', 'vegetarian', 'gluten'];
  return nutritionKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Function to fetch workout data from ExerciseDB
async function fetchWorkoutData(query: string) {
  try {
    // Extract potential target muscles or body parts from the query
    const bodyParts = ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
    const targetMuscles = ['abductors', 'abs', 'adductors', 'biceps', 'calves', 'delts', 'forearms', 'glutes', 'hamstrings', 'lats', 'pectorals', 'quads', 'traps', 'triceps'];
    
    let endpoint = 'https://exercisedb.p.rapidapi.com/exercises';
    let bodyPart = bodyParts.find(part => query.toLowerCase().includes(part));
    let targetMuscle = targetMuscles.find(muscle => query.toLowerCase().includes(muscle));
    
    if (bodyPart) {
      endpoint = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`;
    } else if (targetMuscle) {
      endpoint = `https://exercisedb.p.rapidapi.com/exercises/target/${targetMuscle}`;
    }
    
    console.log(`Fetching workout data from: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': exerciseDBApiKey!,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.status} ${await response.text()}`);
    }
    
    let data = await response.json();
    
    // Limit to 5 exercises to avoid overwhelming the user
    if (Array.isArray(data)) {
      data = data.slice(0, 5);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workout data:', error);
    return null;
  }
}

// Function to fetch recipe data from Spoonacular
async function fetchRecipeData(query: string) {
  try {
    // Extract dietary preferences or calories from the query
    const dietTypes = ['vegetarian', 'vegan', 'gluten free', 'keto', 'paleo'];
    let dietType = dietTypes.find(diet => query.toLowerCase().includes(diet.toLowerCase()));
    
    // Extract calorie information
    let maxCalories = null;
    const calorieMatch = query.match(/(\d+)\s*calories/);
    if (calorieMatch) {
      maxCalories = parseInt(calorieMatch[1]);
    }
    
    // Build query parameters
    let params = new URLSearchParams({
      apiKey: spoonacularApiKey!,
      number: '5', // Limit to 5 recipes
      addRecipeInformation: 'true',
      query: query.replace(/recipe|meal|food|eat/gi, '').trim() // Clean up the query a bit
    });
    
    if (dietType) {
      params.append('diet', dietType);
    }
    
    if (maxCalories) {
      params.append('maxCalories', maxCalories.toString());
    }
    
    console.log(`Fetching recipe data with params: ${params.toString()}`);
    
    const endpoint = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status} ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching recipe data:', error);
    return null;
  }
}

async function generateGeminiResponse(prompt: string) {
  try {
    if (!geminiApiKey) {
      throw new Error("Gemini API key is missing");
    }

    // Use the updated API endpoint for Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Extract the text from the Gemini response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { message, history = [] } = await req.json();
    console.log('Request received:', { message, historyLength: history?.length });
    
    // Check if API keys are available
    if (!geminiApiKey) {
      throw new Error("Gemini API key is missing. Please add it to your environment variables.");
    }
    
    let additionalData = null;
    let dataType = null;
    
    // Check if we should fetch additional data
    if (isWorkoutQuery(message)) {
      console.log("Workout query detected, fetching exercise data...");
      additionalData = await fetchWorkoutData(message);
      dataType = 'exercise';
    } else if (isNutritionQuery(message)) {
      console.log("Nutrition query detected, fetching recipe data...");
      additionalData = await fetchRecipeData(message);
      dataType = 'recipe';
    }

    // Build prompt with additional data if available
    let prompt = message;
    
    if (additionalData && dataType === 'exercise' && Array.isArray(additionalData)) {
      const exerciseSummary = additionalData.map(ex => 
        `Name: ${ex.name}, Target: ${ex.target}, Equipment: ${ex.equipment}`
      ).join('\n');
      
      prompt = `${systemPrompt}\n\nUser query: ${message}\n\nI found these exercises that might be relevant to the user's query. Use this data to provide specific exercise recommendations:\n\n${exerciseSummary}\n\nPlease use this exercise data in your response and begin with "Here's a workout plan for you. You can add it to your workout page." Use simple, clean text format without markdown.`;
    } else if (additionalData && dataType === 'recipe' && Array.isArray(additionalData)) {
      const recipeSummary = additionalData.map(recipe => 
        `Title: ${recipe.title}, Diet: ${recipe.diets?.join(', ') || 'N/A'}`
      ).join('\n');
      
      prompt = `${systemPrompt}\n\nUser query: ${message}\n\nI found these recipes that might be relevant to the user's query. Use this data to provide specific meal recommendations:\n\n${recipeSummary}\n\nPlease use this recipe data in your response and begin with "Here's a recipe you might enjoy. You can save it to your recipe collection." Use simple, clean text format without markdown.`;
    } else {
      prompt = `${systemPrompt}\n\nUser query: ${message}\n\nPlease respond in simple, clean text format without markdown or special formatting.`;
    }

    console.log('Sending prompt to Gemini:', prompt.substring(0, 100) + '...');
    
    // Send message to Gemini
    const text = await generateGeminiResponse(prompt);
    
    console.log('Gemini response received:', text.substring(0, 100) + '...');
    
    // Process the text to remove any special characters
    let cleanedText = text
      .replace(/\*\*/g, '')  // Remove bold markdown
      .replace(/\*/g, '')     // Remove italic markdown
      .replace(/==/g, '')     // Remove highlight markdown
      .replace(/--/g, '')     // Remove strikethrough
      .replace(/```.*?```/gs, '') // Remove code blocks
      .replace(/#/g, '');     // Remove heading markdown
      
    // Return the chatbot response
    return new Response(
      JSON.stringify({
        reply: cleanedText,
        workoutData: dataType === 'exercise' ? additionalData : null,
        recipeData: dataType === 'recipe' ? additionalData : null,
        dataType: dataType
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in gemini-wellness-chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing your request' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
