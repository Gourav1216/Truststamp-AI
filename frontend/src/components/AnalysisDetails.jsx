import React, { useState } from 'react';
import { FileText, Info, Camera, ShieldAlert, BadgeCheck, Eye } from 'lucide-react';

const AnalysisDetails = ({ report }) => {
  const [showRawOCR, setShowRawOCR] = useState(false);
  const { ocr_results, metadata_results, forensics_results, qr_results } = report;

  const formatDate = (isoString) => {
    if (!isoString) return 'Not available';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* 1. OCR PANEL */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <FileText size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>OCR Content Extraction</h3>
          <span className="badge badge-low-risk" style={{ marginLeft: 'auto' }}>
            {ocr_results.avg_confidence}% Confidence
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recipient Name</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {ocr_results.parsed_fields.recipient_name || 'Not detected'}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verification ID</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>
              {ocr_results.parsed_fields.id_number || 'Not detected'}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date of Issue</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {ocr_results.parsed_fields.issue_date || 'Not detected'}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issuer / Institution</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {ocr_results.parsed_fields.institution || 'Not detected'}
            </p>
          </div>
        </div>

        {/* Collapsible raw text */}
        <div>
          <button 
            onClick={() => setShowRawOCR(!showRawOCR)} 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
          >
            <Eye size={14} />
            {showRawOCR ? "Hide Raw Extracted Text" : "View Raw Extracted Text"}
          </button>
          {showRawOCR && (
            <pre style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '0.8rem', color: '#CBD5E1', overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {ocr_results.raw_text}
            </pre>
          )}
        </div>
      </div>

      {/* 2. METADATA INTEGRITY PANEL */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <Camera size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>File Metadata & Timestamps</h3>
          <span className={`badge ${metadata_results.status === 'success' ? 'badge-low-risk' : 'badge-significant'}`} style={{ marginLeft: 'auto' }}>
            {metadata_results.status === 'success' ? 'Intact' : 'Suspicious'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Software / PDF Producer</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.1rem' }}>{metadata_results.software}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Creation Date</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.1rem' }}>{formatDate(metadata_results.creation_date)}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Modification Date</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.1rem' }}>{formatDate(metadata_results.modification_date)}</p>
          </div>
        </div>

        {/* Metadata Warnings */}
        {metadata_results.anomalies.length > 0 ? (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {metadata_results.anomalies.map((anomaly, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#FCA5A5' }}>
                <ShieldAlert size={14} />
                <span>{anomaly}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--status-low-risk)', background: 'rgba(16,185,129,0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
            <BadgeCheck size={16} />
            <span>No software editors or modified timestamp discrepancies found.</span>
          </div>
        )}
      </div>

      {/* 3. SECURE QR VERIFICATION PANEL */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <BadgeCheck size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Embedded QR Code Signature</h3>
          <span className={`badge ${
            qr_results.verification_status === 'verified' ? 'badge-low-risk' : 
            qr_results.verification_status === 'mismatch' ? 'badge-significant' : 'badge-minor'
          }`} style={{ marginLeft: 'auto' }}>
            {qr_results.verification_status === 'verified' ? 'Verified Signature' : 
             qr_results.verification_status === 'mismatch' ? 'Mismatch Alert' : 'No QR Found'}
          </span>
        </div>

        {qr_results.qr_detected ? (
          <div>
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Decoded Cryptographic Payload</span>
              <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: '#CBD5E1', fontFamily: 'monospace' }}>
                {JSON.stringify(qr_results.parsed_data, null, 2)}
              </pre>
            </div>

            {/* Mismatch warnings */}
            {qr_results.discrepancies.length > 0 ? (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {qr_results.discrepancies.map((dis, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#FCA5A5' }}>
                    <ShieldAlert size={14} />
                    <span>{dis}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--status-low-risk)', background: 'rgba(16,185,129,0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
                <BadgeCheck size={16} />
                <span>Security check passed. QR matches visible text.</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <Info size={16} />
            <span>This document does not contain an embedded validation QR seal.</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default AnalysisDetails;
