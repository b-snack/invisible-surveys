import React, { useRef, useEffect, useState } from 'react';
import { HeatmapData } from '../types';

interface HeatmapCanvasProps {
  heatmapData: HeatmapData;
}

const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({ heatmapData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw mouse movements (blue semi-transparent dots)
    heatmapData.mouse_movements.forEach((event) => {
      const x = event.data.x * scale;
      const y = event.data.y * scale;

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 122, 255, 0.3)';
        ctx.fill();
      }
    });

    // Draw clicks
    heatmapData.clicks.forEach((event) => {
      const x = event.data.x * scale;
      const y = event.data.y * scale;

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        ctx.beginPath();
        
        if (event.type === 'rage_click') {
          // Red circle for rage clicks
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 59, 48, 0.7)';
          ctx.fill();
          
          // Inner circle
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 59, 48, 1)';
          ctx.fill();
        } else {
          // Green circle for normal clicks
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(52, 199, 89, 0.7)';
          ctx.fill();
          
          // Inner circle
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(52, 199, 89, 1)';
          ctx.fill();
        }
      }
    });

    // Draw mouse trails (connect recent mouse movements)
    const recentMovements = heatmapData.mouse_movements.slice(-50);
    if (recentMovements.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 122, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      recentMovements.forEach((event, index) => {
        const x = event.data.x * scale;
        const y = event.data.y * scale;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }

    // Draw info text
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(
      `Mouse movements: ${heatmapData.mouse_movements.length} | Clicks: ${heatmapData.clicks.length} | Scale: ${scale.toFixed(2)}x`,
      10,
      canvas.height - 10
    );

  }, [heatmapData, dimensions, scale]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-controls">
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="zoom-button">-</button>
          <span className="zoom-level">Zoom: {scale.toFixed(1)}x</span>
          <button onClick={handleZoomIn} className="zoom-button">+</button>
          <button onClick={handleReset} className="reset-button">Reset</button>
        </div>
        <div className="heatmap-info">
          <span className="info-item">
            <span className="color-dot mouse-move-dot"></span>
            Mouse: {heatmapData.mouse_movements.length}
          </span>
          <span className="info-item">
            <span className="color-dot click-dot"></span>
            Clicks: {heatmapData.clicks.filter(c => c.type === 'click').length}
          </span>
          <span className="info-item">
            <span className="color-dot rage-click-dot"></span>
            Rage: {heatmapData.clicks.filter(c => c.type === 'rage_click').length}
          </span>
        </div>
      </div>
      
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="heatmap-canvas"
        />
      </div>
      
      <div className="heatmap-instructions">
        <p>
          <strong>Interactive Heatmap:</strong> Blue dots show mouse movements, green circles show normal clicks, 
          red circles show rage clicks (3+ clicks within 1s in 50px radius).
        </p>
      </div>
    </div>
  );
};

export default HeatmapCanvas;
