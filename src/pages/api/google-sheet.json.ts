export const prerender = false;

import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

/**
 * Forwards lander form submissions to WordPress, which appends them to a
 * Google Sheet (admin-ajax action `ridge_get_data_to_add_to_sheet`).
 * Requires WP_SHEET_URL and VERIFY_GATSBY env vars (same values as the
 * old Gatsby site's WP_URL / VERIFY_GATSBY).
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const message = JSON.parse(body.message);

    const WP_SHEET_URL  = getSecret('WP_SHEET_URL') || getSecret('WP_URL');
    const VERIFY_GATSBY = getSecret('VERIFY_GATSBY');

    if (!WP_SHEET_URL || !VERIFY_GATSBY) {
      console.log('[google-sheet] WP_SHEET_URL/VERIFY_GATSBY not set — logging submission:', message);
      return new Response(JSON.stringify({ googleError: '' }), { status: 200 });
    }

    const wpResponse = await fetch(WP_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'ridge_get_data_to_add_to_sheet',
        verify: VERIFY_GATSBY,
        data:   JSON.stringify(message),
      }),
    });
    const wpData = await wpResponse.json();

    return new Response(JSON.stringify({ data: wpData, googleError: '' }), { status: 200 });
  } catch (error: any) {
    console.error('[google-sheet] Error:', error);
    return new Response(JSON.stringify({ message: error.message, googleError: error.message }), { status: 500 });
  }
};
