import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

interface EventRow {
  id: number;
  session_id: string;
  type: string;
  timestamp: string;
  data: string;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const events = db.prepare(`
      SELECT * FROM events WHERE session_id = ?
    `).all(id) as EventRow[];
    
    const parsedEvents = events.map(event => ({
      ...event,
      data: JSON.parse(event.data)
    }));
    
    return NextResponse.json(parsedEvents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve session analytics' }, { status: 500 });
  }
}
