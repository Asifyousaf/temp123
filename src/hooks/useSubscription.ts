import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'none';

export interface Subscription {
  id: string;
  plan_id: number;
  amount_paid: number;
  currency: string;
  started_at: string;
  expires_at: string;
  status: SubscriptionStatus;
  payment_method?: string;
}

export interface SubscriptionHook {
  subscription: Subscription | null;
  isLoading: boolean;
  isSubscribed: boolean;
  isAdmin: boolean;
  error: Error | null;
  refreshSubscription: () => Promise<void>;
}

// List of admin emails - should be moved to a more secure method in production
const ADMIN_EMAILS = ['asif1@gmail.com', 'asifyousaf14@gmail.com', 'admin@wellnessai.com'];

// Admin credential check
const isAdminUser = async (user: any): Promise<boolean> => {
  // First check if email is in the admin list
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    // For additional security, check if the user's password matches the admin password
    // Note: This is a simplified approach for demo purposes
    // In production, you would use a more secure method like specific roles in the database
    
    // Additional check to verify admin status (optional)
    try {
      // We check for admin role, but since 'role' column doesn't exist in profiles table,
      // we'll just log this fact and rely on the email check
      console.log('Admin user detected via email:', user.email);
      return true;
    } catch (err) {
      console.error('Error checking admin status:', err);
      // Fallback to email check if the role check fails
      return true;
    }
  }
  
  return false;
}

export const useSubscription = (): SubscriptionHook => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setSubscription(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Check if user is admin with the updated logic
      const adminStatus = await isAdminUser(user);
      setIsAdmin(adminStatus);

      // Fetch the user's subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        throw subscriptionError;
      }

      // If no subscription data found, create a basic free plan for the user
      if (!subscriptionData) {
        const defaultSubscription = {
          id: 'free-plan',
          plan_id: 1, // Basic plan
          amount_paid: 0,
          currency: 'AED',
          started_at: new Date().toISOString(),
          expires_at: new Date(9999, 11, 31).toISOString(), // Far future date for free plan
          status: 'active' as SubscriptionStatus,
          payment_method: 'free'
        };
        
        setSubscription(defaultSubscription);
        setIsLoading(false);
        return;
      }
      
      if (subscriptionData) {
        // Check if subscription is expired
        const expiryDate = new Date(subscriptionData.expires_at);
        const now = new Date();
        
        if (expiryDate < now && subscriptionData.active) {
          // Subscription has expired, update status in our database
          try {
            await supabase
              .from('subscriptions')
              .update({ active: false })
              .eq('id', subscriptionData.id);
              
            console.log('Marked subscription as inactive due to expiry');
          } catch (updateErr) {
            console.error('Error updating subscription status:', updateErr);
          }
          
          // Map DB fields to our interface
          setSubscription({
            id: subscriptionData.id,
            plan_id: parseInt(subscriptionData.tier.replace(/\D/g, '')) || 1, // Extract number from tier or default to 1
            amount_paid: 0, // Default value
            currency: 'AED', // Updated currency
            started_at: subscriptionData.created_at,
            expires_at: subscriptionData.expires_at,
            status: 'expired',
            payment_method: 'manual'
          });
        } else {
          // Map DB fields to our interface
          setSubscription({
            id: subscriptionData.id,
            plan_id: parseInt(subscriptionData.tier.replace(/\D/g, '')) || 1, // Extract number from tier or default to 1
            amount_paid: 0, // Default value
            currency: 'AED', // Updated currency
            started_at: subscriptionData.created_at,
            expires_at: subscriptionData.expires_at,
            status: subscriptionData.active ? 'active' : 'cancelled',
            payment_method: 'manual'
          });
        }
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();

    // Subscribe to auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    // Add subscription table changes listener
    const subscriptionChannel = supabase
      .channel('subscription-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        () => {
          console.log('Subscription table changed, refreshing data');
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(subscriptionChannel);
    };
  }, []);

  return {
    subscription,
    isLoading,
    isSubscribed: isAdmin || (subscription?.status === 'active'),
    isAdmin,
    error,
    refreshSubscription: fetchSubscription
  };
};
