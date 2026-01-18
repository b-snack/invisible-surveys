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
    
    // Generate diverse mouse movement patterns
    const patterns = [
      // Reading pattern (left to right, top to bottom)
      ...Array.from({length: 50}, (_, i) => ({
        x: 50 + (i % 10) * 70 + Math.random() * 20,
        y: 100 + Math.floor(i / 10) * 40 + Math.random() * 15
      })),
      // Product exploration (around product area)
      ...Array.from({length: 40}, (_, i) => ({
        x: 200 + Math.random() * 400,
        y: 200 + Math.random() * 300
      })),
      // Navigation area hovering
      ...Array.from({length: 30}, (_, i) => ({
        x: 100 + Math.random() * 600,
        y: 50 + Math.random() * 50
      })),
      // Random exploration
      ...Array.from({length: 80}, (_, i) => ({
        x: Math.random() * 800,
        y: Math.random() * 600
      }))
    ];

    patterns.forEach((pos, i) => {
      events.push({
        session_id: sessionId,
        type: 'mousemove',
        timestamp: new Date(startTime + i * 100).toISOString(),
        data: JSON.stringify(pos)
      });
    });
    
    // Generate diverse click patterns
    const clickLocations = [
      // Product interactions
      { x: 350, y: 300 }, // Product image
      { x: 450, y: 450 }, // Add to cart
      { x: 450, y: 500 }, // Buy now
      { x: 180, y: 320 }, // Quantity selector
      // Broken payment buttons (clustered)
      { x: 200, y: 600 }, { x: 350, y: 600 }, { x: 500, y: 600 }, { x: 650, y: 600 },
      // Working payment buttons
      { x: 200, y: 650 }, { x: 350, y: 650 }, { x: 500, y: 650 }, { x: 650, y: 650 },
      // Navigation clicks
      { x: 100, y: 50 }, { x: 200, y: 50 }, { x: 600, y: 50 },
      // Review interactions
      { x: 300, y: 700 }, { x: 500, y: 700 },
      // Additional exploration clicks
      ...Array.from({length: 8}, () => ({
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 500
      }))
    ];

    clickLocations.forEach((pos, i) => {
      events.push({
        session_id: sessionId,
        type: 'click',
        timestamp: new Date(startTime + 5000 + i * 500).toISOString(),
        data: JSON.stringify({ 
          ...pos,
          element: 'BUTTON',
          class: i < 4 ? 'broken-btn' : 'working-btn'
        })
      });
    });
    
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
    for (let i = 0; i < 50; i++) {
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
