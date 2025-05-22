
-- Create subscriptions table to track user subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own subscriptions
CREATE POLICY "select_own_subscriptions" ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid());
  
-- Create a policy to allow users to insert their own subscriptions  
CREATE POLICY "insert_own_subscriptions" ON public.subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
  
-- Create a policy to allow users to update their own subscriptions
CREATE POLICY "update_own_subscriptions" ON public.subscriptions
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create an admin user if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM auth.users 
    WHERE email = 'asif1@gmail.com'
  ) THEN
    -- This would be done via the Supabase dashboard or auth API in reality
    -- The create user SQL here is just for reference
    INSERT INTO auth.users (email)
    VALUES ('asif1@gmail.com');
  END IF;
END
$$;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email = 'asif1@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();
