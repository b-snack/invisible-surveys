import React, { useState, useEffect } from 'react';
import './App.css';
import SessionList from './components/SessionList';
import SessionDetail from './components/SessionDetail';
import { Session } from './types';

function App() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/sessions');
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
  };

  const handleBackToList = () => {
    setSelectedSession(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pulse Feedback Dashboard</h1>
        <p className="subtitle">User Behavior Analytics & Heatmaps</p>
      </header>

      <main className="App-main">
        {selectedSession ? (
          <SessionDetail 
            session={selectedSession} 
            onBack={handleBackToList}
          />
        ) : (
          <SessionList 
            sessions={sessions} 
            loading={loading}
            onSessionSelect={handleSessionSelect}
            onRefresh={fetchSessions}
          />
        )}
      </main>

      <footer className="App-footer">
        <p>Pulse Feedback System • Real-time User Behavior Tracking</p>
        <p className="footer-note">
          Backend: localhost:5001 • Auto-refresh: 3s • {sessions.length} sessions tracked
        </p>
      </footer>
    </div>
  );
}

export default App;
