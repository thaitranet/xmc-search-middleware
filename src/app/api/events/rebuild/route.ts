import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { postGraphQL } from '@/app/lib/postGraphQL';
import { searchIngestion } from '@/app/lib/searchIngestion';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.rebuild) {
    return NextResponse.json({ success: false, error: 'Missing rebuild flag' }, { status: 400 });
  }

  const keys = await kv.keys('invocation:*');

  if (!keys || keys.length === 0) {
    return NextResponse.json({ success: true, message: 'No invocation keys to process.' });
  }

  for (const key of keys) {
    const rawItems = await kv.lrange<string>(key, 0, -1);

    if (rawItems.length > 0) {
      // Parse each JSON string into an object
      const ids: { id: string; operation: 'update' | 'delete' }[] = rawItems
        .map(item => {
          try {
            const parsed = typeof item === 'string' ? JSON.parse(item) : item;
            return parsed;
          } catch (err) {
            console.warn(`Failed to parse item in ${key}:`, item);
            return null;
          }
        })
        .filter(Boolean) as { id: string; operation: 'update' | 'delete' }[];

      if (ids.length === 0) continue;

      console.log(`Processing ${key}:`, ids);

      const results = await postGraphQL(ids);

      if (results.length === 0) {
        console.log(`No results found for key ${key}`);
        continue;
      }

      await searchIngestion(results);
    }
  }

  // Delete all processed keys
  await kv.del(...keys);

  return NextResponse.json({ success: true, processedInvocations: keys.length });
}
