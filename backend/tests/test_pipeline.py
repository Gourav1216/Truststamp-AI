import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.services.ocr_engine import OCREngine
from backend.app.services.metadata_engine import MetadataEngine
from backend.app.services.forensics_engine import ForensicsEngine
from backend.app.services.qr_engine import QREngine
from backend.app.services.explainable_engine import ExplainableEngine
from backend.app.services.pipeline import VerificationPipeline

def test_ocr_demo_modes():
    ocr = OCREngine()
    auth_data = ocr.extract_text("doc_authentic.png", "image/png")
    assert auth_data["parsed_fields"]["recipient_name"] == "Gourav Choubey"
    assert auth_data["avg_confidence"] > 95.0
    
    tamp_data = ocr.extract_text("doc_tampered.png", "image/png")
    assert tamp_data["parsed_fields"]["issue_date"] == "June 28, 2026"

def test_metadata_demo_modes():
    meta = MetadataEngine()
    auth_meta = meta.analyze_metadata("doc_authentic.png", "image/png")
    assert auth_meta["status"] == "success"
    assert len(auth_meta["anomalies"]) == 0

    tamp_meta = meta.analyze_metadata("doc_tampered.png", "image/png")
    assert tamp_meta["status"] == "suspicious"
    assert any("Photoshop" in a for a in tamp_meta["anomalies"])

def test_explainable_scoring():
    engine = ExplainableEngine()
    
    # Check authentic template score
    auth_risk = engine.evaluate_risk("doc_authentic.png", {}, {}, {}, {})
    assert auth_risk["trust_score"] == 98
    assert auth_risk["risk_category"] == "Low apparent risk"
    
    # Check tampered template score
    tamp_risk = engine.evaluate_risk("doc_tampered.png", {}, {}, {}, {})
    assert tamp_risk["trust_score"] == 18
    assert tamp_risk["risk_category"] == "High number of suspicious indicators"
    assert len(tamp_risk["scoring_factors"]) > 0

def test_pipeline_integration():
    pipe = VerificationPipeline()
    results = pipe.analyze_document("doc_authentic.png", "image/png")
    assert results["trust_score"] == 98
    assert results["ocr_results"]["parsed_fields"]["recipient_name"] == "Gourav Choubey"
    assert "overlays" in results["forensic_overlay_path"]
