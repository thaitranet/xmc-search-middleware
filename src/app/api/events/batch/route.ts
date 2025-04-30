import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const EXPIRATION_TIME = 60 * 60 * 24; // 1 day in seconds

export async function POST(req: NextRequest) {
  const body = await req.json();
  const updates = body.updates ?? [];
  const invocationId = body.invocation_id;

  if (!invocationId) {
    return NextResponse.json({ success: false, error: 'Missing invocation_id' }, { status: 400 });
  }

  const key = `invocation:${invocationId}`;

  console.log(body);

  const updateIds = updates
    .filter((u: any) => u.identifier?.endsWith('-layout'))
    .map((u: any) => u.identifier.replace('-layout', ''));

  if (updateIds.length > 0) {
    // Add the updates to the queue
    await kv.lpush(key, ...updateIds);

    // Set expiration time for the list without overwriting its value
    await kv.expire(key, EXPIRATION_TIME);
  }

  return NextResponse.json({ success: true, queued: updateIds.length });
}
