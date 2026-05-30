/**
 * Proxy → Uma backend GET /debug/session/{sessionId}
 * No auth required on this endpoint per the API docs.
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.UMA_API_URL ?? process.env.NEXT_PUBLIC_UMA_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND}/debug/session/${sessionId}`, {
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `upstream ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[uma/debug proxy]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
