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
    const ids = await kv.lrange<string>(key, 0, -1);
    if (ids.length > 0) {

      console.log(`Processing ${key}:`, ids);

      const results = await postGraphQL(ids);
      
      if (results.length === 0) {
        console.log('No results found for the given IDs', ids);
        return;
      }
    
      // Send search requests for each document
      await searchIngestion(results);
    }
  }

  // After processing all keys, delete them
  if (keys.length > 0) {
    await kv.del(...keys);
  }

  return NextResponse.json({ success: true, processedInvocations: keys.length });
}
