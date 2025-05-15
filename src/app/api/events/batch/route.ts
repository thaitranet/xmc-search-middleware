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

  // Filter and map updates with operations
  const updateItems = updates
    .filter((u: any) => u.identifier?.endsWith('-layout'))
    .map((u: any) => {
      const id = u.identifier.replace('-layout', '');
      const operation = u.operation == 'Delete' ? 'delete' : 'update'; // Assuming `deleted` flag indicates a delete
      return JSON.stringify({ id, operation });
    });

  if (updateItems.length > 0) {
    // Add structured updates to the queue
    await kv.lpush(key, ...updateItems);

    // Set expiration for the Redis key
    await kv.expire(key, EXPIRATION_TIME);
  }

  return NextResponse.json({ success: true, queued: updateItems.length });
}
