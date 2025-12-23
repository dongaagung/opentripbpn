import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: "admin" | "moderator" | "user";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    
    // Verify the token and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !requestingUser) {
      throw new Error("Unauthorized");
    }

    // Check if requesting user is admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Only admins can create users");
    }

    const { email, password, fullName, role }: CreateUserRequest = await req.json();

    // Create user with admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      throw createError;
    }

    // Add role to user_roles table
    const { error: roleError } = await supabaseClient
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role });

    if (roleError) {
      // Rollback: delete user if role assignment fails
      await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      throw roleError;
    }

    // Create profile entry
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .insert({ 
        user_id: newUser.user.id, 
        full_name: fullName,
        must_change_password: true 
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Don't rollback - user and role are already created
    }

    return new Response(
      JSON.stringify({ user: newUser.user, message: "User created successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
