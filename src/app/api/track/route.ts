import db from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const events = await request.json();
  
  if (!events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: 'Invalid events data' }, { status: 400 });
  }
  
  try {
    const insertStmt = db.prepare('INSERT INTO events (session_id, type, data) VALUES (?, ?, ?)');
    
    const transaction = db.transaction(() => {
      for (const event of events) {
        insertStmt.run(
          event.session_id,
          event.type,
          JSON.stringify(event.data)
        );
      }
    });
    
    transaction();
    return NextResponse.json({ success: true, count: events.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track events' }, { status: 500 });
  }
}
