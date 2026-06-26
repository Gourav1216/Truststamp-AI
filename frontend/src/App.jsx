import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportPage from './pages/ReportPage';
import FileUpload from './components/FileUpload';
import { ShieldCheck, Info } from 'lucide-react';

const MainAppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'upload', 'report'
  const [activeReportId, setActiveReportId] = useState(null);

  const navigateTo = (page, reportId = null) => {
    if (reportId) {
      setActiveReportId(reportId);
    }
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-deep)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', animation: 'spin 2s linear infinite', marginBottom: '1rem' }}>
            <ShieldCheck size={40} color="var(--primary)" />
          </div>
          <p>Initializing TrustStamp secure vault...</p>
        </div>
      </div>
    );
  }

  // Enforce Access Control Screen
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Dynamic Navigation Bar */}
      <Navbar 
        onNavigate={(page) => navigateTo(page)} 
        currentPage={currentPage}
      />

      {/* Main Panel Viewport */}
      <main className="main-content">
        {currentPage === 'dashboard' && (
          <Dashboard 
            onSelectReport={(id) => navigateTo('report', id)} 
            onUploadClick={() => navigateTo('upload')}
          />
        )}
        
        {currentPage === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
                Verify Document Authenticity
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Drop an invoice, receipt, ID card, or academic certificate to run forensic filters.
              </p>
            </div>
            
            <FileUpload 
              onAnalysisComplete={(report) => navigateTo('report', report.id)}
            />
            
            <button 
              onClick={() => navigateTo('dashboard')} 
              className="btn btn-secondary"
              style={{ marginTop: '1rem' }}
            >
              Cancel and Return
            </button>
          </div>
        )}

        {currentPage === 'report' && activeReportId && (
          <ReportPage 
            reportId={activeReportId} 
            onBack={() => navigateTo('dashboard')}
          />
        )}
      </main>

      {/* Ethical & Legal Principles Footer */}
      <footer className="no-print" style={{ background: 'rgba(255,255,255,0.72)', borderTop: '1px solid var(--border-glass)', padding: '1.5rem', marginTop: '4rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>
            <Info size={14} /> Advisory Status Notice
          </div>
          <p style={{ lineHeight: '1.4' }}>
            TrustStamp AI reports are provided as analytical risk assessments to assist review and do not constitute absolute legal certifications of authenticity. We strongly encourage manual inspection of records and direct issuer validation for critical authentication events.
          </p>
          <p style={{ color: '#4B5563', marginTop: '0.25rem' }}>
            © 2026 TrustStamp AI Platform. Built for Hackathon Demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
