'use client';
import { useState, useEffect, useRef } from 'react';
import { Activity, MousePointer2, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch sessions every 3 seconds
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        const data = await res.json();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch events when session is selected
  useEffect(() => {
    if (!selectedSession) return;
    
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/analytics/${selectedSession.id}`);
        const data = await res.json();
        setEvents(data);
        setAnalysis('');
        drawHeatmap(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    
    fetchEvents();
  }, [selectedSession]);
  
  // Draw heatmap on canvas
  const drawHeatmap = (events: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get dimensions for scaling
    const containerWidth = 896; // Matches demo page max width
    const containerHeight = 600; // Estimated demo page height
    
    // Draw mouse movements (blue dots)
    events.filter(e => e.type === 'mousemove').forEach(event => {
      if (event.data && event.data.x !== undefined && event.data.y !== undefined) {
        ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(event.data.x, event.data.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    // Draw clicks (green circles)
    events.filter(e => e.type === 'click').forEach(event => {
      if (event.data && event.data.x !== undefined && event.data.y !== undefined) {
        ctx.fillStyle = 'rgba(40, 167, 69, 0.3)';
        ctx.beginPath();
        ctx.arc(event.data.x, event.data.y, 8, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };
  
  // Generate AI insights
  const generateInsights = async () => {
    if (!selectedSession) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/analyze/${selectedSession.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate metrics
  const clickCount = events.filter(e => e.type === 'click').length;
  const moveCount = events.filter(e => e.type === 'mousemove').length;
  const scrollCount = events.filter(e => e.type === 'scroll').length;
  const positionData = events
    .filter(e => e.type === 'cursor_position')
    .map(e => ({ x: e.data.x, y: e.data.y, timestamp: e.timestamp }));
  
  const generateSampleData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sample-data', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        // Find and select the new sample session
        const newSession = sessions.find((s: any) => s.id === data.sessionId) || 
          (await fetch('/api/sessions').then(res => res.json()))
            .find((s: any) => s.id === data.sessionId);
        if (newSession) setSelectedSession(newSession);
      }
    } catch (error) {
      console.error('Failed to generate sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light text-gray-800">User Session Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/" className="text-blue-500 hover:text-blue-700">Back to Home</Link>
          <button
            onClick={generateSampleData}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm"
          >
            {loading ? 'Generating...' : 'Create Sample'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:w-1/3">
          <h2 className="font-light text-gray-800 mb-3 flex items-center">
            <Activity className="mr-2" size={18} /> Sessions
          </h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {sessions.map(session => (
              <div 
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedSession?.id === session.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="font-medium truncate">{session.page_url}</div>
                <div className="text-sm text-gray-500">
                  {new Date(session.started_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Analytics */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:w-2/3">
          {selectedSession ? (
            <>
              <h2 className="font-light text-gray-800 mb-3">Session Analytics</h2>
              
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                  <MousePointer2 className="text-blue-500 mr-3" size={24} />
                  <div>
                    <div className="text-gray-500">Mouse Moves</div>
                    <div className="text-2xl font-normal">{moveCount}</div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 flex items-center">
                  <MousePointer2 className="text-green-500 mr-3" size={24} />
                  <div>
                    <div className="text-gray-500">Clicks</div>
                    <div className="text-2xl font-normal">{clickCount}</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 flex items-center">
                  <MousePointer2 className="text-purple-500 mr-3" size={24} />
                  <div>
                    <div className="text-gray-500">Scrolls</div>
                    <div className="text-2xl font-normal">{scrollCount}</div>
                  </div>
                </div>
              </div>
              
              {/* Heatmap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-light text-gray-800 mb-2">Interaction Heatmap</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <canvas 
                      ref={canvasRef} 
                      width={400} 
                      height={400}
                      className="w-full h-64 border border-gray-200 rounded"
                    />
                    <div className="flex justify-center mt-2 text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
                        Mouse movements
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                        Clicks
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-light text-gray-800 mb-2">Cursor Position Graph</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="relative h-64">
                      {positionData.length > 0 ? (
                        <div className="grid grid-cols-12 gap-0.5 h-full">
                          {positionData.map((pos, index) => (
                            <div 
                              key={index}
                              className="relative"
                              style={{ gridColumn: `${Math.floor(pos.x / 70) + 1}`, gridRow: `${Math.floor(pos.y / 50) + 1}` }}
                            >
                              <div 
                                className="absolute w-3 h-3 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No cursor position data available
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                        Cursor positions (1s intervals)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Insights */}
              <div>
                <button
                  onClick={generateInsights}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center mb-3"
                >
                  <Lightbulb className="mr-2" size={18} />
                  {loading ? 'Generating...' : 'Generate AI Insights'}
                </button>
                
                {analysis && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-light text-gray-800 mb-2">UX Analysis</h3>
                    <div className="text-gray-700 whitespace-pre-line">{analysis}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center py-10">
              Select a session to view analytics
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
