import type { APIRoute } from 'astro';
import { subscribe } from '../../lib/newsletter.mjs';
export const prerender = false;
export const ALL: APIRoute = ({ request }) => subscribe(request);
