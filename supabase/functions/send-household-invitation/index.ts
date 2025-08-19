import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationEmailRequest {
  invitedEmail: string;
  householdName: string;
  inviterName: string;
  invitationId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitedEmail, householdName, inviterName, invitationId }: InvitationEmailRequest = await req.json();

    if (!invitedEmail || !householdName || !inviterName || !invitationId) {
      throw new Error('Missing required fields');
    }

    console.log('Sending household invitation email:', { invitedEmail, householdName, inviterName });

    // Create invitation acceptance URL - use the actual app domain
    const acceptUrl = `https://82dadc68-d60d-469a-bd32-9ab693f493a5.lovableproject.com/accept-invitation?id=${invitationId}`;

    const emailResponse = await resend.emails.send({
      from: 'Smart Pantry <onboarding@resend.dev>',
      to: [invitedEmail],
      subject: `You're invited to join ${householdName} on Smart Pantry!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Household Invitation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { 
                display: inline-block; 
                background: #667eea; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                margin: 20px 0;
                font-weight: bold;
              }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏠 Household Invitation</h1>
              </div>
              <div class="content">
                <p>Hi there!</p>
                <p><strong>${inviterName}</strong> has invited you to join their household "<strong>${householdName}</strong>" on Smart Pantry.</p>
                <p>Smart Pantry helps households manage their pantry items, track expiration dates, and collaborate on shopping lists together.</p>
                <p>Click the button below to accept the invitation:</p>
                <p style="text-align: center;">
                  <a href="${acceptUrl}" class="button">Accept Invitation</a>
                </p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                  ${acceptUrl}
                </p>
                <p><em>This invitation will expire in 7 days.</em></p>
                <p>If you didn't expect this invitation or don't want to join, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>Happy organizing!<br>The Smart Pantry Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: emailResponse 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-household-invitation function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});