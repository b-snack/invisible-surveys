import React, { useState, useEffect } from 'react';
import { Session, Metrics, HeatmapData, AIAnalysis } from '../types';
import HeatmapCanvas from './HeatmapCanvas';
import MetricsCards from './MetricsCards';
import AIInsights from './AIInsights';

interface SessionDetailProps {
  session: Session;
  onBack: () => void;
}

const SessionDetail: React.FC<SessionDetailProps> = ({ session, onBack }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    fetchSessionData();
  }, [session]);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      // Fetch metrics
      const metricsResponse = await fetch(
        `http://localhost:5001/api/metrics/${session.session_id}`
      );
      const metricsData = await metricsResponse.json();
      if (metricsData.success) {
        setMetrics(metricsData.metrics);
      }

      // Fetch heatmap data
      const heatmapResponse = await fetch(
        `http://localhost:5001/api/heatmap/${session.session_id}`
      );
      const heatmapData = await heatmapResponse.json();
      if (heatmapData.success) {
        setHeatmapData(heatmapData.heatmap_data);
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    setGeneratingAI(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/analyze/${session.session_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="session-detail loading">
        <div className="spinner"></div>
        <p>Loading session data...</p>
      </div>
    );
  }

  return (
    <div className="session-detail">
      <div className="session-detail-header">
        <button onClick={onBack} className="back-button">
          ← Back to Sessions
        </button>
        <div className="session-info">
          <h2>Session Analysis</h2>
          <div className="session-meta">
            <span className="meta-item">
              <strong>ID:</strong> {session.session_id}
            </span>
            <span className="meta-item">
              <strong>Started:</strong> {formatDate(session.started_at)}
            </span>
            <span className="meta-item">
              <strong>Page:</strong>{' '}
              <a href={session.page_url} target="_blank" rel="noopener noreferrer">
                {session.page_url}
              </a>
            </span>
          </div>
        </div>
      </div>

      {metrics && <MetricsCards metrics={metrics} />}

      <div className="heatmap-section">
        <div className="section-header">
          <h3>Interactive Heatmap</h3>
          <div className="heatmap-legend">
            <div className="legend-item">
              <div className="legend-color mouse-move"></div>
              <span>Mouse Movements</span>
            </div>
            <div className="legend-item">
              <div className="legend-color click"></div>
              <span>Normal Clicks</span>
            </div>
            <div className="legend-item">
              <div className="legend-color rage-click"></div>
              <span>Rage Clicks</span>
            </div>
          </div>
        </div>
        {heatmapData ? (
          <HeatmapCanvas heatmapData={heatmapData} />
        ) : (
          <div className="no-heatmap-data">
            <p>No heatmap data available for this session.</p>
          </div>
        )}
      </div>

      <div className="ai-insights-section">
        <div className="section-header">
          <h3>AI-Powered UX Insights</h3>
          <button
            onClick={generateAIInsights}
            disabled={generatingAI}
            className="generate-ai-button"
          >
            {generatingAI ? 'Generating...' : 'Generate AI Insights'}
          </button>
        </div>
        
        {aiAnalysis ? (
          <AIInsights analysis={aiAnalysis} />
        ) : (
          <div className="no-ai-insights">
            <p>
              Click "Generate AI Insights" to analyze user behavior patterns and
              get actionable UX recommendations using Gemini AI.
            </p>
          </div>
        )}
      </div>

      <div className="session-actions">
        <button onClick={fetchSessionData} className="refresh-data-button">
          ↻ Refresh Data
        </button>
        <button onClick={onBack} className="back-button-secondary">
          ← Back to All Sessions
        </button>
      </div>
    </div>
  );
};

export default SessionDetail;
