import React from 'react';
import { Metrics } from '../types';

interface MetricsCardsProps {
  metrics: Metrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Clicks',
      value: metrics.total_clicks,
      description: 'All click interactions',
      color: '#007AFF',
      icon: '🖱️'
    },
    {
      title: 'Rage Clicks',
      value: metrics.rage_clicks,
      description: '3+ clicks in 1s within 50px',
      color: '#FF3B30',
      icon: '🔥'
    },
    {
      title: 'Mouse Movements',
      value: metrics.mouse_movements,
      description: 'Tracked cursor positions',
      color: '#5856D6',
      icon: '↔️'
    },
    {
      title: 'Scroll Events',
      value: metrics.scroll_events,
      description: 'Page scroll interactions',
      color: '#34C759',
      icon: '📜'
    },
    {
      title: 'Keyboard Events',
      value: metrics.keyboard_events,
      description: 'Key press interactions',
      color: '#FF9500',
      icon: '⌨️'
    },
    {
      title: 'Navigation Events',
      value: metrics.navigation_events,
      description: 'Page navigation changes',
      color: '#AF52DE',
      icon: '🧭'
    }
  ];

  return (
    <div className="metrics-cards">
      <h3>Session Metrics</h3>
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className="metric-card">
            <div className="metric-card-header">
              <span className="metric-icon" style={{ color: card.color }}>
                {card.icon}
              </span>
              <h4>{card.title}</h4>
            </div>
            <div className="metric-value" style={{ color: card.color }}>
              {card.value.toLocaleString()}
            </div>
            <div className="metric-description">
              {card.description}
            </div>
            {card.title === 'Rage Clicks' && metrics.total_clicks > 0 && (
              <div className="metric-percentage">
                {((metrics.rage_clicks / metrics.total_clicks) * 100).toFixed(1)}% of total clicks
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsCards;
