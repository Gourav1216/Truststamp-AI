import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl, ensureOk } from '../api';
import { UploadCloud, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

const FileUpload = ({ onAnalysisComplete }) => {
  const { token } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const scanSteps = [
    "Uploading document payload safely...",
    "Running OCR engine text structure scan...",
    "Inspecting file metadata & author tools...",
    "Applying Error Level Analysis (ELA) compression scans...",
    "Checking embedded QR validation signatures...",
    "Compiling explainable risk metrics..."
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Simulates scanning steps smoothly during network delay
  const startScanningAnimation = (callback) => {
    setScanStep(0);
    setScanProgress(0);
    let currentStep = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.max(1, Math.round((100 - progress) * 0.055));
      if (progress >= 100) {
        progress = 99;
      }
      setScanProgress(progress);

      // Transition step text based on progress thresholds
      const stepIndex = Math.min(
        Math.floor((progress / 100) * scanSteps.length),
        scanSteps.length - 1
      );
      setScanStep(stepIndex);
    }, 140);

    return () => clearInterval(interval);
  };

  const processFile = async (file) => {
    // Validate size and format
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload a PDF, PNG, or JPG file.");
      return;
    }
    
    setError(null);
    setUploading(true);

    const stopProgress = startScanningAnimation();
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(apiUrl('/api/v1/verify/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const report = await ensureOk(response, `Verification pipeline failed (${response.status}).`);
      setScanProgress(100);
      setScanStep(scanSteps.length - 1);
      
      // Delay complete callback slightly so user can enjoy the 100% scanning result
      setTimeout(() => {
        setUploading(false);
        stopProgress();
        onAnalysisComplete(report);
      }, 800);

    } catch (err) {
      setError(err.message);
      setUploading(false);
      stopProgress();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
      {!uploading ? (
        <div 
          className={`glass-panel glass-panel-hover ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: dragActive ? '2px dashed var(--primary)' : '1px solid var(--border-glass)',
            backgroundColor: dragActive ? 'rgba(91, 53, 230, 0.06)' : 'var(--bg-glass)'
          }}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-upload-input"
            style={{ display: 'none' }}
            onChange={handleChange}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#EEE9FF', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
            <UploadCloud size={32} color="var(--primary)" />
          </div>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Upload verification document
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Drag and drop your PDF certificate, invoice or scan here (Max 10MB)
          </p>
          <button className="btn btn-primary" type="button">
            Select File
          </button>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} color="var(--secondary)" /> PDF & Image OCR</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} color="var(--secondary)" /> EXIF Metascan</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} color="var(--secondary)" /> Compression ELA</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} color="var(--secondary)" /> QR Crosscheck</span>
          </div>
        </div>
      ) : (
        /* SCANNING PROGRESS ANIMATION SCREEN */
        <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          
          {/* Moving Laser Scanner Overlay */}
          <div className="scanner-line"></div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 4s linear infinite', marginBottom: '2rem' }}>
            <Cpu size={48} className="spin-icon" color="var(--primary)" />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            AI Verification Processing...
          </h3>

          {/* Progress Percent Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--border-glass)' }}>
            <div style={{ width: `${scanProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '9999px', transition: 'width 0.2s ease-out' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <span>{scanSteps[scanStep]}</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{scanProgress}%</span>
          </div>

          {/* Micro scan indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left', background: '#F8F7FF', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: scanProgress > 15 ? 'var(--text-main)' : 'var(--text-muted)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: scanProgress > 15 ? 'var(--secondary)' : '#C9CEE2' }}></div>
              OCR Text Reader {scanProgress > 30 && 'Done'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: scanProgress > 30 ? 'var(--text-main)' : 'var(--text-muted)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: scanProgress > 35 ? 'var(--secondary)' : '#C9CEE2' }}></div>
              EXIF Meta-Inspector {scanProgress > 50 && 'Done'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: scanProgress > 55 ? 'var(--text-main)' : 'var(--text-muted)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: scanProgress > 65 ? 'var(--secondary)' : '#C9CEE2' }}></div>
              Compression Forensics {scanProgress > 75 && 'Done'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: scanProgress > 75 ? 'var(--text-main)' : 'var(--text-muted)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: scanProgress > 85 ? 'var(--secondary)' : '#C9CEE2' }}></div>
              QR Cryptographic Seal {scanProgress > 95 && 'Done'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <AlertTriangle color="#EF4444" size={20} />
          <span style={{ fontSize: '0.9rem', color: '#FCA5A5' }}>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
