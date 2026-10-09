// Public reading analytics only. Never forward form fields, link targets,
// campaign parameters, stored person properties, or external referrer paths.
const hosts = new Set(['rasulkireev.com', 'www.rasulkireev.com']);
const properties = new Set([
  'token', 'distinct_id', '$device_id', '$session_id', '$window_id',
  '$lib', '$lib_version', '$os', '$os_version', '$browser', '$browser_version',
  '$device_type', '$screen_height', '$screen_width', '$viewport_height', '$viewport_width',
  '$time', '$is_identified', '$process_person_profile', '$session_entry_timestamp',
  '$pageview_id', '$prev_pageview_id', '$prev_pageview_duration',
]);

export function publicPageUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.port || url.username || url.password || /^\/api(?:\/|$)/i.test(url.pathname)) return null;
    return url.origin + url.pathname;
  } catch { return null; }
}

function referrerOrigin(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.origin : null;
  } catch { return null; }
}

export function sanitizePageEvent(event, referrer = '') {
  if (!event || !['$pageview', '$pageleave'].includes(event.event)) return null;
  const original = event.properties || {};
  const current = publicPageUrl(original.$current_url);
  if (!current) return null;
  const safe = Object.fromEntries(Object.entries(original).filter(([key, value]) =>
    properties.has(key) && ['string', 'number', 'boolean'].includes(typeof value)));
  safe.$current_url = current;
  safe.$host = new URL(current).hostname;
  safe.$pathname = new URL(current).pathname;
  safe.analytics_schema = 'public-reading-v1';
  const ref = referrerOrigin(referrer);
  safe.$referrer = ref || '$direct';
  safe.$referring_domain = ref ? new URL(ref).hostname : '$direct';
  const entry = publicPageUrl(original.$session_entry_url);
  if (entry) safe.$session_entry_url = entry;
  const entryReferrer = referrerOrigin(original.$session_entry_referrer);
  if (entryReferrer) safe.$session_entry_referrer = entryReferrer;
  // Build the transport envelope explicitly: $set/$set_once can live outside properties.
  return { event: event.event, properties: safe, timestamp: event.timestamp, uuid: event.uuid };
}
