import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

interface EventRow {
  id: number;
  session_id: string;
  type: string;
  timestamp: string;
  data: string;
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    // Retrieve session events
    const events = db.prepare(`
      SELECT * FROM events WHERE session_id = ?
    `).all(id) as EventRow[];
    
    // Count event types
    const clickCount = events.filter(e => e.type === 'click').length;
    const moveCount = events.filter(e => e.type === 'mousemove').length;
    const scrollCount = events.filter(e => e.type === 'scroll').length;

    // Find clusters (simplified)
    const clickClusters = events.filter(e => e.type === 'click')
      .map(e => {
        const data = JSON.parse(e.data);
        return { x: data.x, y: data.y };
      });
    
    // Build Gemini prompt
    const prompt = `Analyze this user session data:
- Total clicks: ${clickCount}
- Total mouse movements: ${moveCount}
- Total scroll events: ${scrollCount}
- Click locations: ${JSON.stringify(clickClusters)}

As a UX expert, identify potential usability issues and provide specific recommendations for improving the website's design based on these interaction patterns.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze session' }, { status: 500 });
  }
}
