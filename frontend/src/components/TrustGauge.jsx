import React, { useState, useEffect } from 'react';

const TrustGauge = ({ score, category, confidence }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score count-up
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      setAnimatedScore(Math.floor(easeProgress * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Determine status color based on score thresholds
  const getColor = (s) => {
    if (s >= 81) return 'var(--status-low-risk)';
    if (s >= 61) return 'var(--status-minor)';
    if (s >= 41) return 'var(--status-moderate)';
    if (s >= 21) return 'var(--status-significant)';
    return 'var(--status-high-risk)';
  };

  const statusColor = getColor(score);
  
  const radius = 72;
  const center = 82;
  const circumference = Math.PI * radius;
  const dash = (animatedScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      
      <div style={{ position: 'relative', width: 184, height: 126 }}>
        <svg width="184" height="116" viewBox="0 0 184 116">
          <defs>
            <linearGradient id="trustGaugeGradient" x1="18" y1="98" x2="166" y2="98" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF453A" />
              <stop offset="0.5" stopColor="#FFB020" />
              <stop offset="1" stopColor="#28C76F" />
            </linearGradient>
          </defs>
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="#EBEDF6"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="url(#trustGaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.14s ease-out' }}
          />
        </svg>
        
        <div style={{
          position: 'absolute',
          top: 30,
          left: 0,
          width: '100%',
          height: 92,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '2.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1 }}>
            {animatedScore}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/100</span>
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
        <h4 style={{ color: statusColor, fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          {category}
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Overall confidence</span>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{confidence}%</span>
        </div>
      </div>
      
    </div>
  );
};

export default TrustGauge;
