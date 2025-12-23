import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate random temporary password
function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

interface ResetPasswordRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { email }: ResetPasswordRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing password reset for email: ${email}`);

    // Find user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listing users:", userError);
      throw userError;
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ message: "Jika email terdaftar, password baru akan dikirim" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: tempPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      throw updateError;
    }

    // Mark user as must change password
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("user_id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // Don't throw, password was already changed
    }

    // Send email with temporary password
    const { error: emailError } = await resend.emails.send({
      from: "Ikigai Trip <onboarding@resend.dev>",
      to: [email],
      subject: "Password Baru Anda - Ikigai Trip",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Reset Password</h1>
          <p>Halo,</p>
          <p>Berikut adalah password sementara Anda:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <code style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px;">${tempPassword}</code>
          </div>
          <p style="color: #d32f2f;"><strong>Penting:</strong> Anda wajib mengganti password ini setelah login.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini atau hubungi administrator.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} Ikigai Trip. All rights reserved.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("Gagal mengirim email");
    }

    console.log(`Password reset email sent to: ${email}`);

    return new Response(
      JSON.stringify({ message: "Password baru telah dikirim ke email Anda" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
