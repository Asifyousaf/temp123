import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import SubscriptionCheckout from '@/components/SubscriptionCheckout';
import AdminSubscriptionManager from '@/components/AdminSubscriptionManager';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isSubscribed, subscription } = useSubscription();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      setLoading(false);
    };
    
    getUser();
  }, []);

  // Determine current plan name based on subscription data
  const getCurrentPlanName = () => {
    if (isAdmin) return 'Admin Plan';
    
    if (subscription?.plan_id) {
      switch(subscription.plan_id) {
        case 1: return 'Basic Plan';
        case 2: return 'Premium Plan';
        case 3: return 'Elite Plan';
        default: return 'Basic Plan';
      }
    }
    
    return 'Basic Plan'; // Default to Basic Plan
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">WellnessAI Subscription Plans</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to enhance your wellness journey with premium AI workout plans and nutrition advice.
          </p>
        </div>
        
        {isAdmin && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-800">Admin Access</h3>
                <p className="text-blue-600 text-sm">You have admin privileges with full access to all features</p>
              </div>
              <Badge className="bg-blue-600">Admin</Badge>
            </div>
          </div>
        )}
        
        {/* Current Plan Section */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-800">Your Current Plan: <span className="font-bold">{getCurrentPlanName()}</span></h3>
              {isSubscribed && subscription && subscription.status === 'active' && !isAdmin ? (
                <p className="text-green-600 text-sm">
                  Your subscription is active until {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-green-600 text-sm">
                  Basic plan is free and provides limited access to features
                </p>
              )}
            </div>
            {isSubscribed && !isAdmin && <Badge className="bg-green-600">Currently Subscribed</Badge>}
          </div>
        </div>
        
        {/* Admin subscription manager - only shown to admin users */}
        {isAdmin && (
          <AdminSubscriptionManager className="mb-8" />
        )}

        <SubscriptionCheckout />

        {/* Benefits section */}
        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Subscription Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-1" />
              <div>
                <h4 className="font-medium">Unlimited AI-Generated Workout Plans</h4>
                <p className="text-gray-600 text-sm">Create personalized workout plans tailored to your goals without limits</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-1" />
              <div>
                <h4 className="font-medium">Premium Nutrition Recipes</h4>
                <p className="text-gray-600 text-sm">Access our complete database of nutritionist-approved recipes</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-1" />
              <div>
                <h4 className="font-medium">Advanced Progress Tracking</h4>
                <p className="text-gray-600 text-sm">Track your fitness journey with detailed analytics and insights</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-1" />
              <div>
                <h4 className="font-medium">Priority AI Chat Support</h4>
                <p className="text-gray-600 text-sm">Get faster responses and more detailed guidance from our AI assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
