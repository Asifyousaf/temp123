
-- Create functions to handle subscription data access and updates

-- Function to get a user's subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id_param UUID)
RETURNS SETOF public.subscriptions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.subscriptions
  WHERE user_id = user_id_param
  AND active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status(subscription_id_param UUID, new_status BOOLEAN)
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET active = new_status
  WHERE id = subscription_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add subscriptions table to Database Types
COMMENT ON TABLE public.subscriptions IS '@graphql({"name": "subscriptions"})';
