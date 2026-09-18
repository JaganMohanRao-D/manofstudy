/**
 * Cloudflare Pages Function: /api/send-reply-alert
 * Dispatches automated transactional notification email via Resend API
 * when a peer or senior answers a student's academic query on MOS CampusConnect.
 */

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    let payload = {};
    try {
      payload = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON request payload' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const {
      toEmail,
      questionTitle = 'Your Academic Doubt',
      replyAuthor = 'A fellow student',
      replyContent = 'A new response was posted to your query.',
      college = 'Campus',
    } = payload || {};

    if (!toEmail || typeof toEmail !== 'string' || !toEmail.includes('@')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A valid toEmail recipient address is required',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fallback to configured Resend API token if not passed in Cloudflare env bindings
    const apiKey = env?.RESEND_API_KEY || 're_2ZBQ4b12_7vRxwSgcwkKrFm2BnnbCyF6y';

    const safeTitle = String(questionTitle).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeAuthor = String(replyAuthor).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeContent = String(replyContent).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

    const emailHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #fbcfe8; border-radius: 16px; background-color: #fffafc;">
  <h2 style="color: #be185d; margin-top: 0; margin-bottom: 8px; font-size: 20px;">🎓 New Answer on MOS CampusConnect!</h2>
  <p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.5;">Hello! A fellow student from ${college} just replied to your question:</p>
  <blockquote style="border-left: 4px solid #f43f5e; padding: 10px 14px; background-color: #ffffff; color: #0f172a; font-weight: 600; margin: 16px 0; border-radius: 4px;">
    "${safeTitle}"
  </blockquote>
  <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #fecdd3; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #9d174d; font-weight: bold;">💬 Answer from ${safeAuthor}:</p>
    <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">${safeContent}</p>
  </div>
  <div style="text-align: center; margin: 24px 0 16px 0;">
    <a href="https://manofstudy.vercel.app/#campus-connect" style="display: inline-block; background-color: #ec4899; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
      View Full Discussion on Man of Study
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #fce7f3; margin: 20px 0 16px 0;" />
  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
    You received this email because you opted in for doubt resolution updates on Man of Study (MOS). Your email is 100% private and never visible to peers.
  </p>
</div>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MOS CampusConnect <onboarding@resend.dev>',
        to: [toEmail.trim()],
        subject: '🎓 Someone just answered your question on Man of Study!',
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.warn('[Resend API dispatch error]:', resendData);
      return new Response(
        JSON.stringify({
          success: false,
          error: resendData?.message || 'Failed to dispatch via Resend API',
          details: resendData,
        }),
        { status: resendRes.status, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: resendData.id,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[send-reply-alert exception]:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal Server Error while sending alert',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
