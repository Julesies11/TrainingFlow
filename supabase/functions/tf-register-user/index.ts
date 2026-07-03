// supabase/functions/tf-register-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("TF_RESEND_API_KEY") ?? Deno.env.get("RESEND_API_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables on server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let email: string | undefined;
    let password: string | undefined;
    let firstName: string | undefined;
    let lastName: string | undefined;
    let username: string | undefined;
    let redirectTo: string | undefined;
    let isResend = false;

    try {
      const body = await req.json();
      email = body?.email;
      password = body?.password;
      firstName = body?.firstName;
      lastName = body?.lastName;
      username = body?.username;
      redirectTo = body?.redirectTo;
      isResend = body?.isResend === true;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isResend && !password) {
      return new Response(
        JSON.stringify({ error: "password is required for registration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const fullname = firstName && lastName ? `${firstName} ${lastName}`.trim() : "";

    // 1. Check if user already exists
    const { data: existingUserData, error: findError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    let user;
    
    if (isResend) {
      // Flow A: Resend verification email
      if (findError || !existingUserData?.user) {
        return new Response(
          JSON.stringify({ error: "No user account found with this email address." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      user = existingUserData.user;
      if (user.email_confirmed_at) {
        return new Response(
          JSON.stringify({ error: "This email address is already verified. Please sign in." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Flow B: User Registration
      if (existingUserData?.user) {
        user = existingUserData.user;
        if (user.email_confirmed_at) {
          return new Response(
            JSON.stringify({ error: "Email address is already registered. Please sign in or reset your password." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // If user exists but is unconfirmed, update their password and metadata and send a new link
        const { data: updatedUserData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          {
            password: password,
            user_metadata: {
              username: username || email.split("@")[0],
              first_name: firstName || "",
              last_name: lastName || "",
              fullname,
            }
          }
        );
        
        if (updateError) {
          console.error("[updateUserById Error]", updateError);
          return new Response(
            JSON.stringify({ error: "Failed to update existing unconfirmed user account." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        user = updatedUserData.user;
      } else {
        // Create new user cleanly
        const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: {
            username: username || email.split("@")[0],
            first_name: firstName || "",
            last_name: lastName || "",
            fullname,
            created_at: new Date().toISOString(),
          },
        });

        if (createError || !newUserData?.user) {
          console.error("[createUser Error]", createError);
          return new Response(
            JSON.stringify({ error: createError?.message || "Failed to create user account" }),
            { status: createError?.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        user = newUserData.user;
      }
    }

    // 2. Generate the signup link securely
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: redirectTo || `${req.headers.get("origin") || ""}/auth/verify-email`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[generateLink Error]", linkError);
      return new Response(
        JSON.stringify({ error: linkError?.message || "Failed to generate signup confirmation link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hashedToken = linkData.properties.hashed_token;

    // Construct domain-matching client verification link using the client origin
    const clientOrigin = redirectTo 
      ? new URL(redirectTo).origin 
      : (req.headers.get("origin") || "https://www.trainingflow.app");

    const customActionLink = `${clientOrigin}/auth/verify-email?token_hash=${hashedToken}&type=signup`;

    // 3. Fallback for testing when Resend API Key is not set up yet
    if (!resendApiKey) {
      console.warn("TF_RESEND_API_KEY is not set. Action link logged to console:");
      console.log(`[TESTING] Signup verification link for ${email}: ${customActionLink}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User created and verification link generated, but TF_RESEND_API_KEY is not configured. Link logged to Deno console logs for testing." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Send email using Resend API via fetch
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TrainingFlow <support@trainingflow.app>", // Assumes verified domain in Resend
        to: [email],
        subject: "Confirm your TrainingFlow Account",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="margin-bottom: 24px; text-align: center;">
              <span style="font-size: 24px; font-weight: 800; color: #22c55e;">TrainingFlow</span>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 12px; text-align: center;">Verify your email</h2>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; text-align: center;">
              Thank you for registering with TrainingFlow! Click the button below to verify your email address and activate your account. This link will expire in 24 hours.
            </p>
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${customActionLink}" style="background-color: #22c55e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.25);">
                Confirm Email
              </a>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px; text-align: center;">
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                If you did not create an account on TrainingFlow, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.json();
      console.error("[Resend Error]", resendError);
      return new Response(
        JSON.stringify({ error: resendError.message || "Failed to deliver verification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: isResend ? "Verification email resent successfully." : "User registered. Verification email sent successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`[tf-register-user Error]`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
