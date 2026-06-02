/**
 * Streaming proxy → Uma backend POST /chat/stream
 * Requires HTTPBearer auth — forwards the user's JWT.
 *
 * SSE event shapes:
 *   { type: "node_start",   node: string }
 *   { type: "node_done",    node: string, insight?: string }
 *   { type: "reply_chunk",  text: string }
 *   { type: "reply_append", text: string }
 *   { type: "done",         payload: ChatResponse }
 *   { type: "error",        message: string }
 */
import { NextRequest } from 'next/server';

const BACKEND = (process.env.UMA_API_URL ?? process.env.NEXT_PUBLIC_UMA_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization') || '';

    if (!body.message) {
      return new Response(
        'data: ' + JSON.stringify({ type: 'error', message: 'message is required' }) + '\n\n',
        { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
      );
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const upstreamRes = await fetch(`${BACKEND}/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: body.message,
        session_id: body.session_id ?? null,
      }),
      // @ts-ignore — Node 18+ supports this
      signal: request.signal,
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      const errText = await upstreamRes.text().catch(() => 'upstream error');
      return new Response(
        'data: ' + JSON.stringify({ type: 'error', message: `upstream ${upstreamRes.status}: ${errText}` }) + '\n\n',
        { status: 502, headers: { 'Content-Type': 'text/event-stream' } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (_) {}
        finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('[uma/chat/stream proxy]', err.message);
    return new Response(
      'data: ' + JSON.stringify({ type: 'error', message: err.message }) + '\n\n',
      { status: 500, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }
}
