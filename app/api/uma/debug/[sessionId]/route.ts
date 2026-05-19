/**
 * Proxy → Uma Python backend GET /debug/session/:sessionId
 * Fetches full debug state for a session including memories, test state, catalog, etc.
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.UMA_API_URL || 'http://74.162.66.197';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const res = await fetch(`${BACKEND}/debug/session/${sessionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      // Return empty debug data if endpoint doesn't exist
      return NextResponse.json({
        memories: [],
        last_pipeline: {},
        assessment: null,
        test_history: [],
        available_tests: {},
      }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error('[uma/debug proxy]', err.message);
    // Return empty debug data on error (non-critical)
    return NextResponse.json({
      memories: [],
      last_pipeline: {},
      assessment: null,
      test_history: [],
      available_tests: {},
    }, { status: 200 });
  }
}
