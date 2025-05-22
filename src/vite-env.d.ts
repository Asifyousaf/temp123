
/// <reference types="vite/client" />

// Declaring additional types for subscription data
interface SubscriptionData {
  id: string;
  user_id: string;
  active: boolean;
  ai_requests_left?: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  tier: string;
}
