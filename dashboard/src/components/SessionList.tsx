import React from 'react';
import { Session } from '../types';

interface SessionListProps {
  sessions: Session[];
  loading: boolean;
  onSessionSelect: (session: Session) => void;
  onRefresh: () => void;
}

const SessionList: React.FC<SessionListProps> = ({ 
  sessions, 
  loading, 
  onSessionSelect,
  onRefresh 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="session-list loading">
        <div className="spinner"></div>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="session-list empty">
        <h2>No Sessions Yet</h2>
        <p>Start tracking user behavior on your website to see sessions here.</p>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="session-list">
      <div className="session-list-header">
        <h2>Recent Sessions ({sessions.length})</h2>
        <div className="header-actions">
          <button onClick={onRefresh} className="refresh-button">
            ↻ Refresh
          </button>
          <span className="auto-refresh-note">Auto-refreshes every 3s</span>
        </div>
      </div>

      <div className="sessions-grid">
        {sessions.map((session) => (
          <div 
            key={session.session_id} 
            className="session-card"
            onClick={() => onSessionSelect(session)}
          >
            <div className="session-card-header">
              <span className="session-id">
                {session.session_id.substring(0, 8)}...
              </span>
              <span className="session-time">
                {formatDate(session.started_at)}
              </span>
            </div>
            
            <div className="session-card-content">
              <div className="session-url">
                <span className="url-label">Page:</span>
                <span className="url-value" title={session.page_url}>
                  {getDomain(session.page_url)}
                </span>
              </div>
              
              <div className="session-meta">
                <span className="meta-item">
                  <span className="meta-label">ID:</span>
                  <code>{session.session_id.substring(0, 12)}...</code>
                </span>
              </div>
            </div>
            
            <div className="session-card-footer">
              <button className="view-details-button">
                View Details & Heatmap →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionList;
