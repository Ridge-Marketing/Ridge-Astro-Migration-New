import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

export const prerender = false;

const SPAM_EMAILS = ['robert.87@outlook.com'];
const SPAM_DOMAINS = ['bankllist.us'];

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  console.log('[sendgrid-basic-contact] POST received');
  try {
    const body = await request.json();
    console.log('[sendgrid-basic-contact] parsed request body', body);

    const { email, message: messageStr } = body;
    const message = JSON.parse(messageStr);
    console.log('[sendgrid-basic-contact] parsed inner message', { email, message });

    // Spam filter
    if (SPAM_EMAILS.includes(message.email) || SPAM_DOMAINS.some((d: string) => messageStr.includes(d))) {
      console.warn('[sendgrid-basic-contact] blocked by spam filter', { email: message.email });
      return json({ error: '' });
    }
    console.log('[sendgrid-basic-contact] passed spam filter');

    // getSecret reads the env var at request time — import.meta.env would be
    // frozen into the bundle at build time, ignoring Netlify dashboard values.
    const SENDGRID_API_KEY = getSecret('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      console.log('[sendgrid-basic-contact] No SENDGRID_API_KEY — logging submission:', message);
      return json({ error: '' });
    }
    console.log('[sendgrid-basic-contact] SENDGRID_API_KEY present');

    const sendGridRequest = {
      personalizations: [
        {
          to: [{ email: 'dev@ridgemarketing.com', name: 'Andrea Quincy' }],
          // cc omitted — SendGrid rejects an empty cc array
          // cc: [
          //   { email: 'rquincy@ridgemarketing.com', name: 'Rob Quincy' },
          //   { email: 'dev@ridgemarketing.com', name: 'Developers' },
          // ],
          subject: `Ridge Site Lead - ${message.name}`,
          dynamic_template_data: {
            name: message.name,
            company: message.company,
            email: message.email,
            phone: message.phone,
            message: message.message,
            companySize: message.companySize,
            companyRevenue: message.companyRevenue,
            budget: message.budget,
            subject: `Ridge Site Lead - ${message.name}`,
          },
        },
      ],
      template_id: 'd-4719197d6c064d99aa32313eb1b3ffc2',
      from: { email: 'noreply@ridgemarketing.com', name: 'No Reply' },
      reply_to: { email },
    };
    console.log('[sendgrid-basic-contact] dispatching to SendGrid', {
      to: sendGridRequest.personalizations[0].to,
      subject: sendGridRequest.personalizations[0].subject,
    });

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendGridRequest),
    });
    console.log('[sendgrid-basic-contact] SendGrid response', { ok: res.ok, status: res.status });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[sendgrid-basic-contact] SendGrid error:', res.status, errorText);
      return json({ error: errorText }, res.status);
    }

    console.log('[sendgrid-basic-contact] success — returning 200');
    return new Response(JSON.stringify({ error: '' }), { status: 200 });
  } catch (error: any) {
    console.error('[sendgrid-basic-contact] Error:', error);
    return json({ error: error.message }, 500);
  }
};
