
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client with Deno.env
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    console.log("Community posts function invoked");
    
    const { action, post } = await req.json();
    console.log(`Action requested: ${action}`);

    // Handle different actions
    if (action === "list") {
      console.log("Listing posts");
      // Try to fetch posts directly from the database
      try {
        const { data, error } = await supabaseClient
          .from('posts')
          .select('*, profiles:user_id(full_name, avatar_url, username)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error(`Error listing posts: ${JSON.stringify(error, null, 2)}`);
        throw error;
      }
    } else if (action === "create") {
      console.log("Creating post", post);
      
      // Get authenticated user
      const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
      
      if (authError || !session) {
        throw new Error("Authentication required to create posts");
      }
      
      // Add user_id to post data
      const postData = {
        ...post,
        user_id: session.user.id
      };
      
      // Insert the post
      const { data, error } = await supabaseClient
        .from('posts')
        .insert(postData)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (action === "like") {
      // Handle like action
      if (!post || !post.id) {
        throw new Error("Post ID required to like a post");
      }

      // Update the post likes count
      const { data, error } = await supabaseClient
        .rpc('increment_likes', { post_id: post.id });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ success: true, message: "Like updated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error(`Function error: ${error}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
