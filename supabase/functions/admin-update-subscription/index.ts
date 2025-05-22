
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const ADMIN_EMAILS = ['asif1@gmail.com', 'asifyousaf14@gmail.com', 'admin@wellnessai.com'];
const ADMIN_PASSWORD = 'Asif@Nutribuddy'; // Updated secure password

console.log('Admin Update Subscription function started')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the request body
    const body = await req.json()
    const { userId, tier, durationMonths, adminPassword } = body
    
    // Verify admin permissions - First check the auth token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '')
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Check if the user is an admin by email
    const isAdminByEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')
    
    // If admin password is provided, check it
    const isPasswordValid = adminPassword === ADMIN_PASSWORD
    
    // Either be an admin by email or provide the correct admin password
    if (!isAdminByEmail && !isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Validate inputs
    if (!userId || !tier) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId and tier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calculate expiration date based on duration in months (default to 1 month)
    const months = durationMonths || 1
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)
    
    console.log(`Updating subscription for user ${userId} to ${tier} for ${months} month(s), expires at ${expiresAt.toISOString()}`)

    // Check if subscription already exists for this user
    const { data: existingSub, error: lookupError } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    let result
    
    if (lookupError) {
      console.error('Error checking for existing subscription:', lookupError)
    }

    if (existingSub) {
      // Update existing subscription
      const { data, error } = await supabaseClient
        .from('subscriptions')
        .update({
          tier: tier,
          active: true,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', existingSub.id)
        .select()

      if (error) throw error
      result = { updated: true, subscription: data }
      console.log('Updated existing subscription')
    } else {
      // Insert new subscription
      const { data, error } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier: tier,
          active: true,
          expires_at: expiresAt.toISOString()
        })
        .select()

      if (error) throw error
      result = { created: true, subscription: data }
      console.log('Created new subscription')
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error handling request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
