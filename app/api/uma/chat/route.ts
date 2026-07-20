/**
 * Proxy → Uma backend POST /chat
 * Requires HTTPBearer auth — forwards the user's JWT from the Authorization header.
 *
 * Input:  { message: string, session_id?: string }
 * Output: ChatResponse { session_id, reply, peek, mesh, strategy,
 *                        expression_style, retrieved_context,
 *                        total_memories, trigger_reason,
 *                        test_state, test_history }
 *
 * NOTE: Uses UMA_API_URL (server-side only, no NEXT_PUBLIC_ prefix) because
 * this runs in a Next.js API route (Node.js), not in the browser.
 * ServerAddress uses NEXT_PUBLIC_UMA_API_URL which is the same value but
 * exposed to the browser — we deliberately keep the server-side key separate.
 */
import { NextRequest, NextResponse } from 'next/server';

// Server-side: UMA_API_URL (not exposed to browser)
// Falls back to the same value as NEXT_PUBLIC_UMA_API_URL for convenience
const BACKEND = (process.env.UMA_API_URL ?? process.env.NEXT_PUBLIC_UMA_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization') || '';

    if (!body.message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(`${BACKEND}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: body.message,
        session_id: body.session_id ?? null,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('[uma/chat proxy]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
