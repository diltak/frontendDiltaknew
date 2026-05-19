/**
 * Proxy → Uma Python backend POST /chat/stream
 * Streams SSE events back to the client for real-time pipeline visualization.
 *
 * Input:  { message: string, session_id?: string, user_id?: string, uma_session_id?: string }
 * Output: SSE stream with events: node_start, node_done, reply_chunk, reply_append, done, error
 */
import { NextRequest } from 'next/server';

const BACKEND = process.env.UMA_API_URL || 'http://74.162.66.197';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization') || '';

    if (!body.message) {
      return new Response(
        `data: ${JSON.stringify({ type: 'error', message: 'message is required' })}\n\n`,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        }
      );
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const backendRes = await fetch(`${BACKEND}/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: body.message,
        session_id: body.session_id ?? null,
        user_id: body.user_id ?? null,
      }),
    });

    if (!backendRes.ok || !backendRes.body) {
      // If the stream endpoint isn't available, fall back to regular /chat
      const fallbackRes = await fetch(`${BACKEND}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: body.message,
          session_id: body.session_id ?? null,
          user_id: body.user_id ?? null,
        }),
      });

      const fallbackData = await fallbackRes.json();
      const reply = fallbackData.response ?? fallbackData.reply ?? fallbackData.message ?? "I'm here for you.";

      // Synthesize SSE events from the regular response
      const events = [
        `data: ${JSON.stringify({ type: 'node_start', node: 'detect_signals' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'detect_signals', insight: fallbackData.emotion || '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_start', node: 'extract_facts' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'extract_facts', insight: '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_start', node: 'fetch_knowledge' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'fetch_knowledge', insight: '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_start', node: 'route_conversation' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'route_conversation', insight: fallbackData.route || '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_start', node: 'read_subtext' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'read_subtext', insight: fallbackData.subtext || '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_start', node: 'recall_memories' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'recall_memories', insight: '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_start', node: 'plan_response' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'plan_response', insight: fallbackData.strategy || '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_start', node: 'generate_reply' })}\n\n`,
        `data: ${JSON.stringify({ type: 'node_done', node: 'generate_reply', insight: '' })}\n\n`,
        `data: ${JSON.stringify({ type: 'reply_chunk', text: reply })}\n\n`,
        `data: ${JSON.stringify({ type: 'done', payload: fallbackData })}\n\n`,
      ];

      return new Response(events.join(''), {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Stream the backend SSE response through to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = backendRes.body.getReader();

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (err) {
        console.error('[uma/chat/stream proxy] stream error:', err);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('[uma/chat/stream proxy]', err.message);
    return new Response(
      `data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  }
}
