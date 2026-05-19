/**
 * Proxy → Uma Python backend POST /chat
 * New Saathi conversational endpoint (full pipeline with RAG + memory).
 *
 * Input:  { message: string, session_id?: string, user_id?: string }
 * Output: full Uma response including pipeline debug fields:
 *   { response, session_id, emotion, subtext, route, strategy,
 *     phase, pipeline_steps, memories, rag_chunks, ... }
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.UMA_API_URL || 'http://74.162.66.197';

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
        user_id: body.user_id ?? null,
      }),
    });

    // Pass through the full response — includes pipeline debug fields
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('[uma/chat proxy]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
