import db from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { session_id, page_url } = await request.json();
  
  if (!session_id || !page_url) {
    return NextResponse.json({ error: 'Missing session_id or page_url' }, { status: 400 });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO sessions (id, page_url) VALUES (?, ?)');
    stmt.run(session_id, page_url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
