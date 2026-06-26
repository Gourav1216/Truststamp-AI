import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl, ensureOk } from '../api';
import TrustGauge from '../components/TrustGauge';
import AnalysisDetails from '../components/AnalysisDetails';
import ForensicViewer from '../components/ForensicViewer';
import { ArrowLeft, Calendar, Download, FileText, Hash, Printer, Trash2, ShieldAlert, BadgeCheck, FileCheck, ShieldQuestion, Upload, User } from 'lucide-react';
import confetti from 'canvas-confetti';

const ReportPage = ({ reportId, onBack }) => {
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl(`/api/v1/reports/${reportId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await ensureOk(response, "Failed to fetch report specifications.");
      setReport(data);
      setError(null);

      // Trigger a hackathon confetti celebration for low-risk authentic files!
      if (data.trust_score >= 81) {
        triggerConfetti();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#14B8A6', '#10B981']
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this verification report permanent?")) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/v1/reports/${report.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await ensureOk(response, "Deletion request failed.");

      onBack(); // Return to dashboard
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRiskBannerStyle = (score) => {
    if (score >= 81) return { bg: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', icon: <BadgeCheck size={28} color="var(--status-low-risk)" />, text: 'var(--status-low-risk)' };
    if (score >= 61) return { bg: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)', icon: <ShieldQuestion size={28} color="var(--status-minor)" />, text: 'var(--status-minor)' };
    if (score >= 41) return { bg: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.2)', icon: <ShieldAlert size={28} color="var(--status-moderate)" />, text: 'var(--status-moderate)' };
    return { bg: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', icon: <ShieldAlert size={28} color="var(--status-significant)" />, text: 'var(--status-significant)' };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Extracting verification metrics...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <ShieldAlert size={36} color="var(--status-significant)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Failed to Load Report</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || "Report details are unavailable."}</p>
        <button onClick={onBack} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const banner = getRiskBannerStyle(report.trust_score);

  return (
    <div className="animate-fade-in print-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header Toolbar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={16} /> Delete Record
          </button>
        </div>
      </div>

      <div className="report-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr) 280px', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ aspectRatio: '3 / 4', borderRadius: 8, border: '1px solid #E5DCF7', background: 'linear-gradient(145deg, #FFF6E9, #F7E2BC)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <FileText size={76} color="#8A6B32" />
              <span className="badge badge-significant" style={{ position: 'absolute', left: 16, bottom: 16, borderRadius: 6 }}>PDF</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', marginBottom: '0.4rem' }}>{report.file_name || 'Verified document'}</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.4rem' }}>PDF Document</p>
              <div style={{ display: 'grid', gap: '1rem', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Calendar size={19} color="var(--text-muted)" /><span><strong>Analyzed on</strong><br />{new Date(report.completed_at).toLocaleString()}</span></div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><User size={19} color="var(--text-muted)" /><span><strong>Uploaded by</strong><br />TrustStamp User</span></div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Hash size={19} color="var(--text-muted)" /><span><strong>Document ID</strong><br />{report.document_id}</span></div>
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.25rem' }}>
              <h3 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '0.4rem' }}>Trust Score</h3>
              <TrustGauge score={report.trust_score} category={report.risk_category} confidence={report.confidence_score} />
            </div>
          </div>

          <div style={{ 
        padding: '1.2rem', 
        borderRadius: '8px', 
        background: banner.bg, 
        border: banner.border,
        display: 'flex', 
        gap: '1.25rem', 
        alignItems: 'flex-start' 
      }}>
        <div style={{ marginTop: '0.2rem' }}>{banner.icon}</div>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
            What does this mean?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
            {report.overall_explanation}
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600, color: banner.text }}>Recommendation:</span>
            <span>{report.recommendation}</span>
          </div>
        </div>
          </div>

          {report.scoring_factors.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>Key Findings</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>AI detected the following results based on multiple verification checks.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {report.scoring_factors.map((factor, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  padding: '1rem', 
                  borderRadius: '8px', 
                  background: '#FFFFFF',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{ maxWidth: '85%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-moderate" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{factor.category}</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{factor.finding}</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {factor.description}
                  </p>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--status-significant)', fontFamily: 'var(--font-heading)' }}>
                  {factor.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Report Summary</h3>
            <div className="metric-row"><span>Trust Score</span><strong>{report.trust_score}/100</strong></div>
            <div className="metric-row"><span>Confidence</span><strong>{report.confidence_score}%</strong></div>
            <div className="metric-row"><span>Risk Category</span><strong>{report.risk_category}</strong></div>
            <div className="metric-row"><span>Scope</span><strong>Advisory</strong></div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Actions</h3>
            <button onClick={handlePrint} className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}><Download size={16} /> Download Report</button>
            <button onClick={onBack} className="btn btn-secondary" style={{ width: '100%' }}><Upload size={16} /> Upload Another</button>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(145deg, #FFFFFF, #F1EDFF)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Powered by AI</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.55, fontSize: '0.9rem' }}>Results are advisory. Final decisions should be made by a human expert.</p>
          </div>
        </aside>
      </div>

      {/* 5. Details Section: Left Details & Right Forensics View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
        
        {/* Left Side: Text data & systems */}
        <div>
          <AnalysisDetails report={report} />
        </div>

        {/* Right Side: ELA & Pixel grids */}
        <div>
          <ForensicViewer report={report} />
        </div>

      </div>

    </div>
  );
};

export default ReportPage;
