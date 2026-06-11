export const prerender = false;

import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

const SPAM_EMAILS = ['robert.87@outlook.com'];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, subject, message: messageStr } = body;
    const message = JSON.parse(messageStr);

    // Spam filter
    if (SPAM_EMAILS.includes(message.email)) {
      return new Response(JSON.stringify({ error: '' }), { status: 200 });
    }

    const SENDGRID_API_KEY = getSecret('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      console.log('[sendgrid-ppc-hero] No SENDGRID_API_KEY — logging submission:', message);
      return new Response(JSON.stringify({ error: '' }), { status: 200 });
    }

    const mailSubject = subject?.length ? subject : `Ridge PPC Hero Lead - ${message.name}`;

    const sendGridRequest = {
      personalizations: [
        {
          to: [{ email: 'aquincy@ridgemarketing.com', name: 'Andrea Quincy' }],
          cc: [
            { email: 'rquincy@ridgemarketing.com', name: 'Rob Quincy' },
            { email: 'dev@ridgemarketing.com', name: 'Developers' },
            { email: 'chase@ridgemarketing.com', name: 'Chase' },
          ],
          subject: mailSubject,
          dynamic_template_data: {
            name:    message.name,
            email:   message.email,
            source:  message.source,
            subject: mailSubject,
          },
        },
      ],
      template_id: 'd-eea7a403662548d39b583b0a700bcb2f',
      from: { email: 'noreply@ridgemarketing.com', name: 'No Reply' },
      reply_to: { email },
    };

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendGridRequest),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[sendgrid-ppc-hero] SendGrid error:', res.status, errorText);
      return new Response(JSON.stringify({ error: errorText }), { status: res.status });
    }

    return new Response(JSON.stringify({ error: '' }), { status: 200 });
  } catch (error: any) {
    console.error('[sendgrid-ppc-hero] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
