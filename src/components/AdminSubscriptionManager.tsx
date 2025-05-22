
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface AdminSubscriptionManagerProps {
  className?: string;
}

type UserWithSubscription = {
  id: string;
  email: string;
  subscription?: {
    id: string;
    tier: string;
    active: boolean;
    expires_at: string;
  } | null;
};

const AdminSubscriptionManager: React.FC<AdminSubscriptionManagerProps> = ({ className = '' }) => {
  const { isAdmin } = useSubscription();
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('1');
  const [subscriptionDuration, setSubscriptionDuration] = useState<number>(1);
  const [updating, setUpdating] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      console.log('Admin attempting to fetch users');
      
      // First get users from auth
      const { data: authUsersData, error: authError } = await supabase.functions.invoke('admin-get-users', {
        body: { action: 'list-users' }
      });
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }
      
      // If we got no data from the edge function
      if (!authUsersData || !Array.isArray(authUsersData) || authUsersData.length === 0) {
        console.log('No users returned from admin-get-users function, falling back to profiles');
        
        // Fallback to profiles table if admin function failed
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username');
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }
        
        if (!profilesData || profilesData.length === 0) {
          console.log('No profiles found either');
          setUsers([]);
          setLoading(false);
          return;
        }
        
        // Fetch subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*');
          
        if (subError) {
          console.error('Error fetching subscriptions:', subError);
          throw subError;
        }
        
        // Map profiles to users
        const usersFromProfiles = profilesData.map(profile => {
          const userSub = subscriptions?.find(sub => sub.user_id === profile.id);
          return {
            id: profile.id,
            email: profile.username || profile.full_name || `User ID: ${profile.id.substring(0, 8)}...`,
            subscription: userSub ? {
              id: userSub.id,
              tier: userSub.tier,
              active: userSub.active,
              expires_at: userSub.expires_at
            } : null
          };
        });
        
        console.log('Users from profiles:', usersFromProfiles);
        setUsers(usersFromProfiles);
      } else {
        // Process users from auth
        console.log('Got users from admin function:', authUsersData.length);
        
        // Fetch subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*');
          
        if (subError) {
          console.error('Error fetching subscriptions:', subError);
          throw subError;
        }
        
        // Map auth users with subscription data
        const processedUsers = authUsersData.map(user => {
          const userSub = subscriptions?.find(sub => sub.user_id === user.id);
          return {
            id: user.id,
            email: user.email || user.phone || `User: ${user.id.substring(0, 8)}...`,
            subscription: userSub ? {
              id: userSub.id,
              tier: userSub.tier,
              active: userSub.active,
              expires_at: userSub.expires_at
            } : null
          };
        });
        
        console.log('Processed users with subscriptions:', processedUsers);
        setUsers(processedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Make sure you have admin privileges.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserSubscription = async () => {
    if (!isAdmin || !selectedUserId) return;
    
    if (!adminPassword) {
      toast({
        title: 'Admin Password Required',
        description: 'Please enter the admin password to update subscriptions',
        variant: 'destructive',
      });
      return;
    }
    
    setUpdating(true);
    try {
      console.log(`Updating subscription for user ${selectedUserId} to plan${selectedPlan} for ${subscriptionDuration} months`);
      
      // Call our edge function to update the subscription
      const { data, error } = await supabase.functions.invoke('admin-update-subscription', {
        body: {
          userId: selectedUserId,
          tier: `plan${selectedPlan}`, // Convert plan number to tier string format
          durationMonths: subscriptionDuration,
          adminPassword: adminPassword // Pass the admin password for verification
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Subscription Updated',
        description: `User subscription has been updated to plan ${selectedPlan} for ${subscriptionDuration} month(s).`,
      });
      
      // Clear the admin password field after successful update
      setAdminPassword('');
      
      // Refresh user list
      await fetchUsers();
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Check admin password or console for details.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
    
    // Set up a subscription table listener to refresh the data when subscriptions change
    const channel = supabase
      .channel('admin-subscription-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        () => {
          console.log('Subscription table changed, refreshing admin data');
          fetchUsers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return null; // Don't show anything if not admin
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Admin Subscription Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search and User List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Input 
                placeholder="Search user by email" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={fetchUsers} 
                variant="outline" 
                size="sm" 
                className="ml-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Refresh
              </Button>
            </div>
            
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="p-4 text-center text-gray-500">No users found</p>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${selectedUserId === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {user.subscription && (
                          <p className="text-sm text-gray-500">
                            Plan: {user.subscription.tier} - 
                            Status: {user.subscription.active ? 'active' : 'inactive'} - 
                            Expires: {new Date(user.subscription.expires_at).toLocaleDateString()}
                          </p>
                        )}
                        {!user.subscription && (
                          <p className="text-sm text-gray-500">No subscription</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Subscription Management */}
          {selectedUserId && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Update Subscription</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plan</label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Basic Plan (20 AED)</SelectItem>
                      <SelectItem value="2">Premium Plan (50 AED)</SelectItem>
                      <SelectItem value="3">Elite Plan (100 AED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (months)</label>
                  <Select
                    value={subscriptionDuration.toString()} 
                    onValueChange={(value) => setSubscriptionDuration(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 month</SelectItem>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Password</label>
                <Input
                  type="password"
                  placeholder="Enter admin password to authorize"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={updateUserSubscription}
                  disabled={updating || !adminPassword}
                >
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Subscription
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSubscriptionManager;
