import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl, ensureOk } from '../api';
import { UploadCloud, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

const svgToDataUrl = (svgString) => {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
};

const authenticElaSvg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#020617"/>
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="4,8"/>
  <text x="400" y="300" font-family="monospace" font-size="14" fill="#334155" text-anchor="middle">
    ERROR LEVEL ANALYSIS (ELA) - NO ANOMALIES DETECTED
  </text>
  <circle cx="200" cy="150" r="1" fill="#0891b2" opacity="0.3"/>
  <circle cx="340" cy="400" r="1.5" fill="#0891b2" opacity="0.4"/>
  <circle cx="500" cy="220" r="1" fill="#0891b2" opacity="0.2"/>
  <circle cx="610" cy="380" r="2" fill="#0891b2" opacity="0.5"/>
</svg>
`;

const tamperedElaSvg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="70%" cy="65%" r="15%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="30%" stop-color="#06b6d4" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#020617"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,8" opacity="0.3"/>
  <text x="400" y="50" font-family="monospace" font-size="14" fill="#ef4444" text-anchor="middle" font-weight="bold">
    ELA DETECTED COMPRESSION DISPARITY (DATE FIELD AREA)
  </text>
</svg>
`;

const tamperedAlignSvg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="400" y="80" font-family="sans-serif" font-size="20" fill="#1e293b" font-weight="bold" text-anchor="middle">GLOBAL TRUST UNIVERSITY</text>
  <text x="400" y="200" font-family="sans-serif" font-size="15" fill="#475569" text-anchor="middle">Awarded to Gourav Choubey</text>
  <text x="400" y="260" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Verification ID: GTU-99281-A</text>
  
  <text x="320" y="340" font-family="sans-serif" font-size="13" fill="#64748b">Issue Date: </text>
  <text x="420" y="337" font-family="sans-serif" font-size="13" fill="#ef4444" font-weight="bold">June 28, 2026</text>
  <rect x="415" y="320" width="120" height="26" fill="none" stroke="#ef4444" stroke-width="2"/>
  <text x="415" y="365" font-family="sans-serif" font-size="11" fill="#ef4444">Alignment Shift (+3px)</text>
</svg>
`;

const mismatchAlignSvg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="400" y="80" font-family="sans-serif" font-size="20" fill="#1e293b" font-weight="bold" text-anchor="middle">GLOBAL TRUST UNIVERSITY</text>
  <text x="400" y="200" font-family="sans-serif" font-size="15" fill="#475569" text-anchor="middle">Awarded to Gourav Choubey</text>
  
  <text x="300" y="260" font-family="sans-serif" font-size="13" fill="#64748b">Verification ID: </text>
  <text x="420" y="262" font-family="sans-serif" font-size="13" fill="#f97316" font-weight="bold">GTU-88772-B</text>
  <rect x="415" y="245" width="110" height="26" fill="none" stroke="#f97316" stroke-width="2"/>
  <text x="415" y="290" font-family="sans-serif" font-size="11" fill="#f97316">Baseline deviation detected</text>
</svg>
`;

const generateMockReport = (fileName) => {
  const lowercaseName = fileName.toLowerCase();
  const id = `report-demo-${Math.random().toString(36).substr(2, 9)}`;
  const documentId = `doc-demo-${Math.random().toString(36).substr(2, 9)}`;
  const completedAt = new Date().toISOString();

  if (lowercaseName.includes("tampered")) {
    return {
      id,
      document_id: documentId,
      file_name: fileName,
      file_size: 154200,
      uploaded_at: completedAt,
      completed_at: completedAt,
      trust_score: 18,
      risk_category: "High number of suspicious indicators",
      confidence_score: 96.0,
      ocr_results: {
        raw_text: "GLOBAL TRUST UNIVERSITY\nCertificate of Academic Excellence\nAwarded to Gourav Choubey\nFor outstanding performance in Artificial Intelligence.\nVerification ID: GTU-99281-A\nIssue Date: June 28, 2026\nSigned: Dr. Sarah Jenkins, Registrar",
        parsed_fields: {
          recipient_name: "Gourav Choubey",
          id_number: "GTU-99281-A",
          issue_date: "June 28, 2026",
          institution: "GLOBAL TRUST UNIVERSITY"
        },
        avg_confidence: 98.1,
        status: "success",
        source: "simulated_ocr"
      },
      metadata_results: {
        camera_make: "Unknown",
        camera_model: "Unknown",
        software: "Adobe Photoshop CC 2025 (Windows)",
        modify_date: "2026-06-26 12:15:32",
        create_date: "2026-06-15 10:00:00",
        anomalies: [
          "Editing software trace detected: Adobe Photoshop CC 2025 (Windows)"
        ]
      },
      forensics_results: {
        compression_anomaly: true,
        alignment_anomaly: true,
        findings: [
          "JPEG compression disparity detected around 'June 28, 2026' date region.",
          "Text alignment check indicates a vertical baseline shift of +3 pixels in date field.",
          "Localized high-frequency noise suggests copy-paste metadata embedding."
        ],
        ela_overlay_url: svgToDataUrl(tamperedElaSvg),
        alignment_overlay_url: svgToDataUrl(tamperedAlignSvg),
        status: "suspicious"
      },
      qr_results: {
        qr_detected: true,
        verification_status: "mismatch",
        discrepancies: [
          "Issue Date mismatch: QR registers original date 'June 15, 2026' but visible document displays 'June 28, 2026'"
        ],
        payload: {
          recipient_name: "Gourav Choubey",
          id_number: "GTU-99281-A",
          issue_date: "June 15, 2026",
          institution: "GLOBAL TRUST UNIVERSITY"
        }
      },
      scoring_factors: [
        {
          category: "Security Feature Validation",
          impact: "-40%",
          finding: "Issue Date mismatch: QR registers original date 'June 15, 2026' but visible document displays 'June 28, 2026'",
          description: "Critical security mismatch: the information encrypted in the secure QR code does not align with the text printed visibly on the document."
        },
        {
          category: "Image Forensics",
          impact: "-30%",
          finding: "Localized JPEG compression grid disparity (ELA peak)",
          description: "Error Level Analysis detected a localized area with different compression characteristics. This is a strong indicator of copy-paste tampering."
        },
        {
          category: "Metadata Integrity",
          impact: "-20%",
          finding: "Editing software trace detected: Adobe Photoshop CC 2025 (Windows)",
          description: "Metadata logs show editing software artifacts or timeline conflicts, indicating the file was saved or altered after generation."
        },
        {
          category: "Typography Forensics",
          impact: "-15%",
          finding: "Baseline character alignment shift detected (Offset +3px)",
          description: "Calculated text coordinates deviate from the line's standard slope, suggesting character insertion or structural font modification."
        }
      ],
      overall_explanation: "Multiple critical anomalies were detected. The visible issue date ('June 28, 2026') does not match the original date registered in the embedded QR code ('June 15, 2026'). Additionally, Error Level Analysis (ELA) detected a highly localized compression grid discrepancy and text baseline alignment deviation (+3px) around the date field, and metadata signatures reveal post-issuance modification using Adobe Photoshop.",
      recommendation: "High risk. Immediate manual verification and audit of the physical certificate is strongly recommended."
    };
  } else if (lowercaseName.includes("mismatch")) {
    return {
      id,
      document_id: documentId,
      file_name: fileName,
      file_size: 142100,
      uploaded_at: completedAt,
      completed_at: completedAt,
      trust_score: 42,
      risk_category: "Moderate anomalies",
      confidence_score: 97.0,
      ocr_results: {
        raw_text: "GLOBAL TRUST UNIVERSITY\nCertificate of Academic Excellence\nAwarded to Gourav Choubey\nFor outstanding performance in Artificial Intelligence.\nVerification ID: GTU-88772-B\nIssue Date: June 15, 2026\nSigned: Dr. Sarah Jenkins, Registrar",
        parsed_fields: {
          recipient_name: "Gourav Choubey",
          id_number: "GTU-88772-B",
          issue_date: "June 15, 2026",
          institution: "GLOBAL TRUST UNIVERSITY"
        },
        avg_confidence: 98.9,
        status: "success",
        source: "simulated_ocr"
      },
      metadata_results: {
        camera_make: "Unknown",
        camera_model: "Unknown",
        software: "Unknown",
        modify_date: "2026-06-15 10:00:00",
        create_date: "2026-06-15 10:00:00",
        anomalies: []
      },
      forensics_results: {
        compression_anomaly: false,
        alignment_anomaly: true,
        findings: [
          "No localized compression (ELA) anomalies detected.",
          "Character alignment check flags minor spacing issues in Verification ID: 'GTU-88772-B'."
        ],
        ela_overlay_url: svgToDataUrl(authenticElaSvg),
        alignment_overlay_url: svgToDataUrl(mismatchAlignSvg),
        status: "warning"
      },
      qr_results: {
        qr_detected: true,
        verification_status: "mismatch",
        discrepancies: [
          "ID mismatch: QR contains 'GTU-99281-A' but visible document displays 'GTU-88772-B'"
        ],
        payload: {
          recipient_name: "Gourav Choubey",
          id_number: "GTU-99281-A",
          issue_date: "June 15, 2026",
          institution: "GLOBAL TRUST UNIVERSITY"
        }
      },
      scoring_factors: [
        {
          category: "Security Feature Validation",
          impact: "-40%",
          finding: "ID mismatch: QR contains 'GTU-99281-A' but visible document displays 'GTU-88772-B'",
          description: "Critical security mismatch: the information encrypted in the secure QR code does not align with the text printed visibly on the document."
        },
        {
          category: "Typography Forensics",
          impact: "-15%",
          finding: "Baseline character alignment shift detected around Verification ID",
          description: "Calculated text coordinates deviate from the line's standard slope, suggesting character insertion or structural font modification."
        }
      ],
      overall_explanation: "A moderate risk profile was detected. The Verification ID displayed on the document ('GTU-88772-B') does not match the Verification ID embedded in the authentic QR code ('GTU-99281-A'). Text baseline check also identified character alignment variance around the ID number field.",
      recommendation: "Manual review recommended. Verify the document ID against the issuer database."
    };
  } else {
    return {
      id,
      document_id: documentId,
      file_name: fileName,
      file_size: 122800,
      uploaded_at: completedAt,
      completed_at: completedAt,
      trust_score: 98,
      risk_category: "Low apparent risk",
      confidence_score: 98.5,
      ocr_results: {
        raw_text: "GLOBAL TRUST UNIVERSITY\nCertificate of Academic Excellence\nAwarded to Gourav Choubey\nFor outstanding performance in Artificial Intelligence.\nVerification ID: GTU-99281-A\nIssue Date: June 15, 2026\nSigned: Dr. Sarah Jenkins, Registrar",
        parsed_fields: {
          recipient_name: "Gourav Choubey",
          id_number: "GTU-99281-A",
          issue_date: "June 15, 2026",
          institution: "GLOBAL TRUST UNIVERSITY"
        },
        avg_confidence: 99.4,
        status: "success",
        source: "simulated_ocr"
      },
      metadata_results: {
        camera_make: "Unknown",
        camera_model: "Unknown",
        software: "Canon EOS Utility",
        modify_date: "2026-06-15 10:00:00",
        create_date: "2026-06-15 10:00:00",
        anomalies: []
      },
      forensics_results: {
        compression_anomaly: false,
        alignment_anomaly: false,
        findings: [
          "JPEG compression grid is uniform across the entire document canvas.",
          "Text alignment shows standard baseline slopes (< 0.2 degrees variation).",
          "No localized compression spikes or editing seams detected."
        ],
        ela_overlay_url: svgToDataUrl(authenticElaSvg),
        alignment_overlay_url: null,
        status: "success"
      },
      qr_results: {
        qr_detected: true,
        verification_status: "verified",
        discrepancies: [],
        payload: {
          recipient_name: "Gourav Choubey",
          id_number: "GTU-99281-A",
          issue_date: "June 15, 2026",
          institution: "GLOBAL TRUST UNIVERSITY"
        }
      },
      scoring_factors: [],
      overall_explanation: "All forensic checks passed successfully. The document structure, metadata timestamps, compression history, and embedded QR code validation match perfectly without any anomalies.",
      recommendation: "Safe to process automatically. No further action needed."
    };
  }
};

const FileUpload = ({ onAnalysisComplete }) => {
  const { user, token, isDemoMode, addDemoReport } = useAuth();
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

    const isDemo = isDemoMode || (user && user.id === 'demo-user') || !token || token.startsWith('demo-token:');
    if (isDemo) {
      setError(null);
      setUploading(true);
      const stopProgress = startScanningAnimation();

      setTimeout(() => {
        const report = generateMockReport(file.name);
        addDemoReport(report);
        setScanProgress(100);
        setScanStep(scanSteps.length - 1);
        
        setTimeout(() => {
          setUploading(false);
          stopProgress();
          onAnalysisComplete(report);
        }, 800);
      }, 3500); // 3.5 seconds of simulated scan animation
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
