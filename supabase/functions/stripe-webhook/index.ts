
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

serve(async (req) => {
  // Skip CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }
  
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: "Stripe secret key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  try {
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the raw request body
    const body = await req.text();
    let event;

    // Verify the event if webhook secret is configured
    if (endpointSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } catch (err) {
        return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      // If no webhook secret, just parse the event
      event = JSON.parse(body);
    }

    // Connect to Supabase with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object;
        
        // Get customer and subscription details
        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription
        );
        
        const customer = await stripe.customers.retrieve(
          checkoutSession.customer
        );
        
        if (!customer.email) {
          throw new Error("Customer email not found");
        }

        // Get the user associated with this email
        const { data: users, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', customer.email)
          .limit(1);

        if (userError || !users || users.length === 0) {
          throw new Error(`User not found for email: ${customer.email}`);
        }

        const userId = users[0].id;
        
        // Calculate subscription details
        const subscriptionPeriodEnd = new Date(subscription.current_period_end * 1000);
        const subscriptionItems = subscription.items.data;
        const price = subscriptionItems[0]?.price;
        const priceId = price?.id;
        
        // Record the subscription in the database
        const { error: insertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: checkoutSession.customer,
            stripe_subscription_id: checkoutSession.subscription,
            status: 'active',
            plan_id: parseInt(priceId?.split('_')[1] || '1'),
            amount_paid: price?.unit_amount || 0,
            currency: price?.currency || 'usd',
            started_at: new Date().toISOString(),
            expires_at: subscriptionPeriodEnd.toISOString(),
            payment_method: checkoutSession.payment_method_types[0],
            updated_at: new Date().toISOString()
          }, 
          { onConflict: 'user_id' });

        if (insertError) {
          throw new Error(`Error inserting subscription: ${insertError.message}`);
        }
        
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Retrieve customer info
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        
        if (!customer.email) {
          throw new Error("Customer email not found");
        }

        // Get the user associated with this email
        const { data: users, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', customer.email)
          .limit(1);

        if (userError || !users || users.length === 0) {
          throw new Error(`User not found for email: ${customer.email}`);
        }

        const userId = users[0].id;
        
        // Update the subscription in the database
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'cancelled',
            expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          throw new Error(`Error updating subscription: ${updateError.message}`);
        }
        
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Retrieve customer info
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        
        if (!customer.email) {
          throw new Error("Customer email not found");
        }

        // Get the user associated with this email
        const { data: users, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', customer.email)
          .limit(1);

        if (userError || !users || users.length === 0) {
          throw new Error(`User not found for email: ${customer.email}`);
        }

        const userId = users[0].id;
        
        // Mark the subscription as cancelled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          throw new Error(`Error updating subscription: ${updateError.message}`);
        }
        
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
