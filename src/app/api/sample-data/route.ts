import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
  try {
    // Create sample session
    const sessionId = `sample_${Date.now()}`;
    const pageUrl = '/demo';
    
    const insertSession = db.prepare(
      'INSERT INTO sessions (id, started_at, page_url) VALUES (?, ?, ?)'
    );
    insertSession.run(sessionId, new Date().toISOString(), pageUrl);

    // Generate sample events
    const events = [];
    const startTime = Date.now();
    
    // Generate mouse movements
    for (let i = 0; i < 50; i++) {
      events.push({
        session_id: sessionId,
        type: 'mousemove',
        timestamp: new Date(startTime + i * 100).toISOString(),
        data: JSON.stringify({ x: Math.random() * 800, y: Math.random() * 600 })
      });
    }
    
    // Generate clicks (including some on broken buttons)
    for (let i = 0; i < 8; i++) {
      events.push({
        session_id: sessionId,
        type: 'click',
        timestamp: new Date(startTime + 5000 + i * 500).toISOString(),
        data: JSON.stringify({ 
          x: 200 + (i % 4) * 150, 
          y: 500,
          element: 'BUTTON',
          class: i < 4 ? 'broken-btn' : 'working-btn'
        })
      });
    }
    
    // Generate scroll events
    for (let i = 0; i < 5; i++) {
      events.push({
        session_id: sessionId,
        type: 'scroll',
        timestamp: new Date(startTime + 8000 + i * 800).toISOString(),
        data: JSON.stringify({ x: 0, y: 100 + i * 100 })
      });
    }
    
    // Generate cursor position events
    for (let i = 0; i < 15; i++) {
      events.push({
        session_id: sessionId,
        type: 'cursor_position',
        timestamp: new Date(startTime + i * 1000).toISOString(),
        data: JSON.stringify({ 
          x: Math.random() * 800, 
          y: Math.random() * 600 
        })
      });
    }
    
    // Insert all events
    const stmt = db.prepare(
      'INSERT INTO events (session_id, type, timestamp, data) VALUES (?, ?, ?, ?)'
    );
    
    const insertMany = db.transaction((events) => {
      for (const event of events) {
        stmt.run(
          event.session_id,
          event.type,
          event.timestamp,
          event.data
        );
      }
    });
    
    insertMany(events);
    
    return NextResponse.json({ success: true, sessionId }, { status: 200 });
  } catch (error) {
    console.error('Sample data generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample data' },
      { status: 500 }
    );
  }
}
