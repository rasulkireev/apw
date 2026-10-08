const ORIGIN = 'https://www.rasulkireev.com';
const SUCCESS = 'Check your inbox for a confirmation link. If you are already subscribed, you are all set.';
function reply(request, status, message) {
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' };
  if (request.headers.get('accept')?.includes('application/json')) return Response.json({ message }, { status, headers });
  // Messages are fixed strings only. Never reflect subscriber data or provider errors.
  headers['Content-Type'] = 'text/html; charset=utf-8';
  headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'";
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Newsletter — Rasul Kireev</title><style>body{font:1.2rem system-ui;max-width:40rem;margin:10vh auto;padding:1rem;line-height:1.6}a{color:#166534}</style><h1>${status === 200 ? 'Check your inbox' : 'Unable to subscribe'}</h1><p>${message}</p><a href="/newsletter/">Back to the newsletter</a></html>`, { status, headers });
}
export async function subscribe(request, env = process.env, send = fetch) {
  if (request.method !== 'POST') return reply(request, 405, 'Please use the signup form.');
  if (request.headers.get('origin') !== ORIGIN) return reply(request, 403, 'Please subscribe using the form on this website.');
  const type = request.headers.get('content-type')?.split(';')[0];
  if (!['application/json', 'application/x-www-form-urlencoded'].includes(type)) return reply(request, 415, 'Unsupported form format.');
  let data;
  try {
    // Bound streamed bodies too, not just Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return reply(request, 400, 'Please enter a valid email address.');
    const chunks = []; let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > 4096) { await reader.cancel(); return reply(request, 413, 'The submitted form is too large.'); }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    data = type === 'application/json' ? JSON.parse(text) : Object.fromEntries(new URLSearchParams(text));
  } catch { return reply(request, 400, 'Please enter a valid email address.'); }
  if (!data || typeof data !== 'object') return reply(request, 400, 'Please enter a valid email address.');
  if (data.website) return reply(request, 200, SUCCESS);
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const name = data.name ?? '';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || typeof name !== 'string' || name.length > 100 || /[\r\n]/.test(name)) return reply(request, 400, 'Please enter a valid email address and a name of at most 100 characters.');
  const listUUID = env.LISTMONK_LIST_UUID;
  if (!env.LISTMONK_URL || !listUUID || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(listUUID)) return reply(request, 503, 'Signup is temporarily unavailable. Please try again later.');
  const attribs = {};
  if (typeof data.tag === 'string' && /^[a-z-]{1,30}$/.test(data.tag)) attribs.signup_tag = data.tag;
  // Intentionally omit arbitrary URLs/query strings and IP addresses from subscriber attributes.
  try {
    const response = await send(`${env.LISTMONK_URL.replace(/\/$/, '')}/api/public/subscription`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: name.trim(), list_uuids: [listUUID], attribs }), signal: AbortSignal.timeout(8000), redirect: 'error' });
    if (!response.ok) throw new Error('upstream');
    const result = await response.json();
    // Confirmed/duplicate subscribers may have has_optin=false. Do not disclose membership.
    if (typeof result?.data?.has_optin !== 'boolean') throw new Error('contract');
    return reply(request, 200, SUCCESS);
  } catch { return reply(request, 503, 'Signup is temporarily unavailable. Please try again later.'); }
}
