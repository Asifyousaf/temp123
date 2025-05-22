
export interface Recipe {
  id?: string;
  title: string;
  diets?: string[];
  calories?: number;
  nutrition?: { 
    calories?: number; 
    protein?: number; 
    carbs?: number; 
    fat?: number; 
  };
  image?: string;
  summary?: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  servings?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  readyInMinutes?: number;
  messageId?: string;
  [key: string]: any;
}
