
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

interface SubscriptionCheckoutProps {
  onSuccess?: () => void;
}

const plans: Plan[] = [
  {
    id: '1',
    name: 'Basic Plan',
    price: 0,
    duration: 'month',
    features: [
      'Free access to basic workouts',
      'Limited nutrition tracking',
      'Community access',
    ]
  },
  {
    id: '2',
    name: 'Premium Plan',
    price: 50,
    duration: 'month',
    features: [
      'Everything in Basic',
      'Advanced exercise analytics',
      'Meal planning assistance',
      'Priority support',
    ],
    popular: true
  },
  {
    id: '3',
    name: 'Elite Plan',
    price: 100,
    duration: 'month',
    features: [
      'Everything in Premium',
      'Personal trainer consultations',
      'Custom nutrition plans',
      'Unlimited AI-powered workouts',
      'Exclusive content access',
    ]
  }
];

const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { subscription, isSubscribed, refreshSubscription } = useSubscription();
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch current user details when component loads
    const getUserDetails = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email || "");
      }
    };
    
    getUserDetails();
  }, []);

  // Function to direct users to contact for manual setup
  const openContactForm = (plan: Plan) => {
    setSelectedPlan(plan);
    setContactFormOpen(true);
  };

  // Send email for plan request (opens user's email client)
  const sendManualSubscriptionRequest = () => {
    if (!selectedPlan || !userEmail || !userName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create email content
      const subject = `Subscription Request: ${selectedPlan.name}`;
      const body = `Name: ${userName}
Email: ${userEmail}
User ID: ${userId || 'Not logged in'}
Plan: ${selectedPlan.name} (${selectedPlan.price} AED/${selectedPlan.duration})
Message: ${contactMessage || "No additional message"}

Please process this subscription request manually.`;

      // Open user's email client with pre-filled details
      const mailtoLink = `mailto:asifyousaf14@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      toast({
        title: 'Request Sent',
        description: 'Your email client has been opened. Please send the email to complete your request.',
      });
      setContactFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process your request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to check if a plan is the current plan
  const isCurrentPlan = (planId: string) => {
    if (!subscription) {
      // Basic plan (id: '1') is default for everyone
      return planId === '1';
    }
    return subscription.plan_id === parseInt(planId);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPlanSubscribed = isCurrentPlan(plan.id);
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col ${plan.popular ? 'border-purple-400 shadow-lg' : ''} ${isPlanSubscribed ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="bg-purple-600 text-white text-center py-1 font-medium text-sm">
                  MOST POPULAR
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  {isPlanSubscribed && (
                    <Badge className="bg-green-600">Current Plan</Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-2xl font-bold">{plan.price === 0 ? 'FREE' : `${plan.price} AED`}</span>
                  {plan.price > 0 && <span className="text-gray-500">/{plan.duration}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {isPlanSubscribed ? (
                  <Button variant="outline" className="w-full" disabled>
                    Currently Subscribed
                  </Button>
                ) : (
                  plan.id !== '1' && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => openContactForm(plan)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Contact for Setup
                    </Button>
                  )
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Contact Form Dialog */}
      <Dialog open={contactFormOpen} onOpenChange={setContactFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Fill out this form to contact the admin about setting up your subscription. The form will open your email client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="col-span-3 min-h-[100px]"
                placeholder="Add any additional information or requests here"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setContactFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendManualSubscriptionRequest}>
              Open Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionCheckout;
