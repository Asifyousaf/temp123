
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, ChevronRight, Clock, Users, 
  Heart, Salad, Beef, Coffee, Apple, Egg 
} from 'lucide-react';
import { motion } from 'framer-motion';
import RecipeDetails from '../components/RecipeDetails';

// Sample recipe data
const recipes = [
  {
    id: 1,
    title: "High Protein Overnight Oats",
    image: "https://images.unsplash.com/photo-1557637958-7c8bc29599c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    time: "5 min prep + overnight",
    servings: 1,
    calories: 350,
    description: "A quick, nutritious breakfast that you prepare the night before. These protein-packed overnight oats will keep you fueled all morning.",
    ingredients: [
      "1/2 cup rolled oats",
      "1 scoop protein powder (vanilla or your choice)",
      "1 tablespoon chia seeds",
      "1 cup almond milk (or milk of choice)",
      "1 tablespoon honey or maple syrup",
      "1/4 cup Greek yogurt",
      "1/2 banana, sliced",
      "Handful of berries"
    ],
    instructions: [
      "In a mason jar or container, mix oats, protein powder, and chia seeds.",
      "Pour in the milk and add honey/maple syrup. Stir well.",
      "Add Greek yogurt and stir to combine.",
      "Seal and refrigerate overnight or for at least 4 hours.",
      "In the morning, top with sliced banana and berries before eating."
    ],
    tags: ["High Protein", "Breakfast", "Meal Prep"],
    category: "breakfast"
  },
  {
    id: 2,
    title: "Grilled Chicken Salad with Avocado",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    time: "20 min",
    servings: 2,
    calories: 420,
    description: "A fresh and filling salad loaded with protein from grilled chicken and healthy fats from avocado. Perfect for lunch or a light dinner.",
    ingredients: [
      "2 chicken breasts, boneless and skinless",
      "4 cups mixed greens",
      "1 avocado, sliced",
      "1 cup cherry tomatoes, halved",
      "1/4 red onion, thinly sliced",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "1 tsp Dijon mustard",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Season chicken breasts with salt and pepper.",
      "Grill chicken for 6-7 minutes per side until fully cooked. Let rest, then slice.",
      "In a bowl, whisk together olive oil, lemon juice, mustard, salt, and pepper for the dressing.",
      "In a large bowl, combine mixed greens, cherry tomatoes, and red onion.",
      "Top with sliced chicken and avocado.",
      "Drizzle dressing over the salad just before serving."
    ],
    tags: ["High Protein", "Lunch", "Salad"],
    category: "lunch"
  },
  {
    id: 3,
    title: "Protein-Packed Smoothie Bowl",
    image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    time: "10 min",
    servings: 1,
    calories: 380,
    description: "A thick, creamy smoothie bowl topped with nutritious ingredients - perfect for a post-workout meal or refreshing breakfast.",
    ingredients: [
      "1 frozen banana",
      "1 cup frozen mixed berries",
      "1 scoop protein powder",
      "1/2 cup Greek yogurt",
      "1/4 cup almond milk",
      "Toppings: granola, fresh berries, chia seeds, sliced almonds"
    ],
    instructions: [
      "Add frozen banana, berries, protein powder, Greek yogurt, and almond milk to a blender.",
      "Blend until smooth and thick. Add more milk if needed, but keep it thick enough to eat with a spoon.",
      "Pour into a bowl.",
      "Arrange toppings on the smoothie bowl in sections.",
      "Enjoy immediately before it melts!"
    ],
    tags: ["High Protein", "Breakfast", "Post-Workout"],
    category: "breakfast"
  },
  {
    id: 4,
    title: "Baked Salmon with Roasted Vegetables",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    time: "30 min",
    servings: 2,
    calories: 510,
    description: "A nutrient-dense dinner featuring omega-3 rich salmon and a colorful array of roasted vegetables.",
    ingredients: [
      "2 salmon fillets (6 oz each)",
      "2 cups broccoli florets",
      "1 red bell pepper, sliced",
      "1 zucchini, sliced",
      "1 red onion, cut into wedges",
      "2 tbsp olive oil",
      "2 cloves garlic, minced",
      "1 lemon",
      "2 tsp dried herbs (thyme, rosemary, or Italian mix)",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Toss vegetables with 1 tbsp olive oil, garlic, half the herbs, salt, and pepper. Spread on a baking sheet.",
      "Roast vegetables for 15 minutes.",
      "Meanwhile, season salmon with remaining herbs, salt, and pepper.",
      "Push vegetables to the sides of the baking sheet and place salmon in the center.",
      "Drizzle salmon with remaining olive oil and squeeze half the lemon over everything.",
      "Return to oven and bake for 12-15 minutes until salmon is cooked through.",
      "Serve with remaining lemon wedges."
    ],
    tags: ["High Protein", "Dinner", "Omega-3"],
    category: "dinner"
  }
];

const NutritionPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const categories = [
    { id: 'all', name: 'All', icon: <Salad /> },
    { id: 'breakfast', name: 'Breakfast', icon: <Coffee /> },
    { id: 'lunch', name: 'Lunch', icon: <Apple /> },
    { id: 'dinner', name: 'Dinner', icon: <Beef /> },
    { id: 'snacks', name: 'Snacks', icon: <Egg /> },
  ];
  
  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="pt-24 pb-16 bg-gradient-to-br from-green-500 to-green-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nutrition Planner</h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            Discover healthy, delicious recipes tailored to your fitness goals.
          </p>
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300" />
              <Input
                className="pl-10 pr-4 py-6 bg-white/10 border-white/20 placeholder:text-white/70 text-white"
                placeholder="Search for recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 space-x-2 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md">
                  <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center text-xs mb-2">
                  <span className="bg-green-100 text-green-800 rounded-full px-2.5 py-1">
                    {recipe.tags[0]}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
                
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {recipe.time}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSelectedRecipe(recipe)}
                  variant="outline" 
                  className="w-full border-green-200 text-green-800 hover:bg-green-50 mt-2"
                >
                  View Recipe
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredRecipes.length === 0 && (
          <div className="text-center py-16">
            <Salad className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No recipes found</h3>
            <p className="text-gray-500 mt-2">Try changing your search or filters</p>
          </div>
        )}
      </div>
      
      {/* Recipe Details Dialog */}
      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </Layout>
  );
};

export default NutritionPage;
