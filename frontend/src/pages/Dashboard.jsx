import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import { apiUrl, ensureOk } from '../api';
import { Search, Filter, FileText, Trash2, Calendar, AlertTriangle, Upload, ShieldCheck, ScanText, QrCode, FileSearch } from 'lucide-react';

const Dashboard = ({ onSelectReport, onUploadClick }) => {
  const { user, token, isDemoMode, getDemoReports, deleteDemoReport } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const isDemo = isDemoMode || (user && user.id === 'demo-user') || !token || token.startsWith('demo-token:');
    if (isDemo) {
      const demoData = getDemoReports();
      const filtered = demoData.filter(r => {
        const matchesSearch = !search || r.file_name.toLowerCase().includes(search.toLowerCase());
        const matchesRisk = !selectedRisk || r.risk_category === selectedRisk;
        return matchesSearch && matchesRisk;
      });
      setReports(filtered);
      setError(null);
      setLoading(false);
      return;
    }

    fetchReports();
  }, [search, selectedRisk, isDemoMode, user, token]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let url = '/api/v1/reports';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (selectedRisk) params.push(`risk=${encodeURIComponent(selectedRisk)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(apiUrl(url), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await ensureOk(response, "Failed to load reports history.");
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, reportId) => {
    e.stopPropagation(); // Stop row click
    if (!window.confirm("Are you sure you want to delete this analysis report and its secure storage files?")) {
      return;
    }

    const isDemo = isDemoMode || (user && user.id === 'demo-user') || !token || token.startsWith('demo-token:');
    if (isDemo) {
      deleteDemoReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/v1/reports/${reportId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await ensureOk(response, "Failed to delete report.");

      // Remove from state
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getScoreColor = (score) => {
    if (score >= 81) return 'var(--status-low-risk)';
    if (score >= 61) return 'var(--status-minor)';
    if (score >= 41) return 'var(--status-moderate)';
    if (score >= 21) return 'var(--status-significant)';
    return 'var(--status-high-risk)';
  };

  const riskCategories = [
    "Low apparent risk",
    "Minor anomalies",
    "Moderate anomalies",
    "Significant anomalies",
    "High number of suspicious indicators"
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F0FF 100%)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', background: '#F0ECFF', padding: '0.35rem 0.7rem', borderRadius: 999, fontWeight: 700, fontSize: '0.8rem', marginBottom: '1rem' }}><ShieldCheck size={15} /> AI-Powered Verification</div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem', maxWidth: 560 }}>Verify Documents. Detect Risks. Stay Confident.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.65, maxWidth: 620 }}>Analyze documents and images using advanced checks for tampering, metadata anomalies, OCR mismatches, QR codes, and explainable risk scoring.</p>
        </div>
        <button 
          onClick={onUploadClick} 
          className="btn btn-primary"
          style={{ padding: '0.9rem 1.5rem', minWidth: 190 }}
        >
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        {[
          [FileSearch, 'Document Forensics', 'Detects signs of editing or manipulation.'],
          [Filter, 'Metadata Analysis', 'Checks file metadata for inconsistencies.'],
          [ScanText, 'OCR & Text Check', 'Extracts and verifies text mismatches.'],
          [QrCode, 'QR Verification', 'Validates embedded codes and signatures.'],
        ].map(([Icon, title, copy]) => (
          <div key={title} className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#EEE9FF', color: 'var(--primary)', marginBottom: '0.85rem' }}><Icon size={24} /></div>
            <h3 style={{ fontSize: '0.98rem', marginBottom: '0.45rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{copy}</p>
          </div>
        ))}
      </div>

      {/* Grid: Upload Widget & History list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Verification history list */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary)" /> Analysis Archives
          </h2>

          {/* Filters controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search files by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
              <Filter size={18} color="var(--text-muted)" />
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="">All Risk Tiers</option>
                {riskCategories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading verification archives...
            </div>
          ) : error ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.9rem' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border-glass)', borderRadius: '12px' }}>
              <FileText size={36} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.3rem' }}>No verification reports found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {search || selectedRisk ? "No records match your active query filters." : "Upload a PDF document or scan above to perform verification."}
              </p>
              {(search || selectedRisk) && (
                <button onClick={() => { setSearch(''); setSelectedRisk(''); }} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* Tabular Reports list */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Document Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Upload Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Size</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Trust Score</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Risk Category</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr 
                      key={report.id}
                      onClick={() => onSelectReport(report.id)}
                      className="table-row-hover"
                      style={{ 
                        borderBottom: '1px solid var(--border-glass)', 
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <FileText size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                        {report.file_name}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                          <Calendar size={12} />
                          {formatDate(report.uploaded_at)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {formatBytes(report.file_size)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: 800, 
                          color: getScoreColor(report.trust_score),
                          fontFamily: 'var(--font-heading)'
                        }}>
                          {report.trust_score}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${
                          report.trust_score >= 81 ? 'badge-low-risk' :
                          report.trust_score >= 61 ? 'badge-minor' :
                          report.trust_score >= 41 ? 'badge-moderate' :
                          report.trust_score >= 21 ? 'badge-significant' : 'badge-high-risk'
                        }`}>
                          {report.risk_category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={(e) => handleDelete(e, report.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem', borderRadius: '6px' }}
                          title="Delete verification history entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
