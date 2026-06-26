import React, { useState } from 'react';
import { Eye, Focus, AlertTriangle, ShieldCheck } from 'lucide-react';

const ForensicViewer = ({ report }) => {
  const [activeTab, setActiveTab] = useState('ela'); // 'ela' or 'alignment'
  const { forensics_results } = report;
  
  // Map static paths properly
  const elaUrl = forensics_results.ela_overlay_url;
  const alignmentUrl = forensics_results.alignment_overlay_url;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <Focus size={20} color="var(--primary)" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Visual Forensics Studio</h3>
        <span className={`badge ${forensics_results.compression_anomaly || forensics_results.alignment_anomaly ? 'badge-significant' : 'badge-low-risk'}`} style={{ marginLeft: 'auto' }}>
          {forensics_results.compression_anomaly || forensics_results.alignment_anomaly ? 'Altered Traces' : 'Intact Pixels'}
        </span>
      </div>

      {/* Forensic tab selectors */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('ela')}
          className="btn"
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '0.85rem',
            background: activeTab === 'ela' ? 'var(--primary-glow)' : 'transparent',
            border: `1px solid ${activeTab === 'ela' ? 'var(--primary)' : 'var(--border-glass)'}`,
            color: activeTab === 'ela' ? '#FFF' : 'var(--text-muted)'
          }}
        >
          Error Level Analysis (ELA)
        </button>
        
        {alignmentUrl && (
          <button
            onClick={() => setActiveTab('alignment')}
            className="btn"
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.85rem',
              background: activeTab === 'alignment' ? 'var(--primary-glow)' : 'transparent',
              border: `1px solid ${activeTab === 'alignment' ? 'var(--primary)' : 'var(--border-glass)'}`,
              color: activeTab === 'alignment' ? '#FFF' : 'var(--text-muted)'
            }}
          >
            Alignment Check
          </button>
        )}
      </div>

      {/* Visual Canvas Panel */}
      <div style={{ background: '#020617', borderRadius: '8px', border: '1px solid var(--border-glass)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', marginBottom: '1.25rem', position: 'relative' }}>
        
        {activeTab === 'ela' ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            {elaUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <img 
                  src={elaUrl} 
                  alt="Error Level Analysis Grid" 
                  style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 0 20px rgba(6,182,212,0.15)' }} 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={12} /> High brightness shapes signify pixel manipulation hot-spots.
                </span>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ELA overlay not available for this file type.
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', textAlign: 'center' }}>
            {alignmentUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <img 
                  src={alignmentUrl} 
                  alt="Typography Alignment Highlight" 
                  style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }} 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={12} /> Bounding boxes draw attention to misaligned text baselines.
                </span>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Alignment analysis not run.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Observations text box */}
      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '1rem' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.5rem' }}>
          Forensic Observations
        </h4>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#E2E8F0' }}>
          {forensics_results.findings.map((finding, idx) => (
            <li key={idx} style={{ listStyleType: 'square' }}>
              {finding}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default ForensicViewer;
