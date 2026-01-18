import db from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sessions = db.prepare(`
      SELECT * FROM sessions ORDER BY started_at DESC
    `).all();
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve sessions' }, { status: 500 });
  }
}
