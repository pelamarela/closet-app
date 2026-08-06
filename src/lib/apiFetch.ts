import { supabase } from './supabase'

// Wraps fetch for our own /api/* routes, attaching the current Supabase
// session token so serverless functions can verify the caller before
// spending Anthropic API credits.
export async function apiFetch(url: string, body: unknown): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}
