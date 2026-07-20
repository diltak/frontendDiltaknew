
import ServerAddress from '@/constent/ServerAddress';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization') || '';

    if (!body.user_id || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'user_id and non-empty messages array are required' },
        { status: 400 },
      );
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(`${ServerAddress}/api/chat_wrapper/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: body.user_id,
        messages: body.messages, // [{role, content}]
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('[chat_wrapper/analyze proxy]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
