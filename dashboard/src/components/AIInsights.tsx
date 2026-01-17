import React from 'react';
import { AIAnalysis } from '../types';

interface AIInsightsProps {
  analysis: AIAnalysis;
}

const AIInsights: React.FC<AIInsightsProps> = ({ analysis }) => {
  return (
    <div className="ai-insights">
      <div className="ai-section main-problem">
        <h4>Main Usability Problem</h4>
        <div className="problem-content">
          <div className="problem-icon">⚠️</div>
          <p>{analysis.main_problem}</p>
        </div>
      </div>

      <div className="ai-section insights">
        <h4>Specific Insights</h4>
        <div className="insights-list">
          {analysis.insights.map((insight, index) => (
            <div key={index} className="insight-item">
              <div className="insight-number">{index + 1}</div>
              <div className="insight-content">
                <p>{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-section recommendations">
        <h4>Actionable UX Recommendations</h4>
        <div className="recommendations-grid">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="recommendation-card">
              <div className="recommendation-header">
                <span className="recommendation-number">#{index + 1}</span>
                <span className="recommendation-priority">
                  {index === 0 ? 'High Priority' : index === 1 ? 'Medium Priority' : 'Low Priority'}
                </span>
              </div>
              <div className="recommendation-content">
                <p>{recommendation}</p>
              </div>
              <div className="recommendation-actions">
                <button className="action-button implement">Implement</button>
                <button className="action-button schedule">Schedule</button>
                <button className="action-button research">Research</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-footer">
        <div className="ai-source">
          <span className="ai-badge">🤖 AI Analysis</span>
          <span className="ai-model">Powered by Gemini AI</span>
        </div>
        <div className="ai-timestamp">
          Generated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
