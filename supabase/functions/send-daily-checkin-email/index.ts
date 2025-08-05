import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  user_email: string;
  mood_label: string;
  mood_rating: number;
  questions_suggestions: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email, mood_label, mood_rating, questions_suggestions }: EmailRequest = await req.json();

    // For now, just log the email data
    // In production, you would integrate with an email service like Resend
    console.log('📧 Daily Check-in Email Data:', {
      from: user_email,
      to: 'andries@bko.co.za',
      subject: `Daily Check-in: ${mood_label} (${mood_rating}/5)`,
      content: {
        user_email,
        mood_label,
        mood_rating,
        questions_suggestions,
        timestamp: new Date().toISOString()
      }
    });

    // TODO: Implement actual email sending with Resend or similar service
    // This is a placeholder that logs the email data
    // To implement actual email sending, you would need:
    // 1. Add RESEND_API_KEY to Supabase secrets
    // 2. Import and use Resend library
    // 3. Send email to andries@bko.co.za

    return new Response(
      JSON.stringify({ 
        message: 'Email logged successfully',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-daily-checkin-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);