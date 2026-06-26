from backend.app.services.ocr_engine import OCREngine
from backend.app.services.metadata_engine import MetadataEngine
from backend.app.services.forensics_engine import ForensicsEngine
from backend.app.services.qr_engine import QREngine
from backend.app.services.explainable_engine import ExplainableEngine

class VerificationPipeline:
    def __init__(self):
        self.ocr_engine = OCREngine()
        self.metadata_engine = MetadataEngine()
        self.forensics_engine = ForensicsEngine()
        self.qr_engine = QREngine()
        self.explainable_engine = ExplainableEngine()

    def analyze_document(self, file_path: str, mime_type: str) -> dict:
        """
        Coordinates the execution of all verification stages on the file.
        """
        # Step 1: Content Extraction
        ocr_results = self.ocr_engine.extract_text(file_path, mime_type)
        
        # Step 2: Metadata Inspection
        metadata_results = self.metadata_engine.analyze_metadata(file_path, mime_type)
        
        # Step 3: Forensics Checks (Error Level Analysis & Text Alignment)
        forensics_results = self.forensics_engine.perform_forensics(file_path, mime_type)
        
        # Step 4: Secure QR Validation
        qr_results = self.qr_engine.decode_and_verify(file_path, ocr_results.get("parsed_fields", {}))
        
        # Step 5: Consolidate explainable risk assessment
        risk_results = self.explainable_engine.evaluate_risk(
            file_path=file_path,
            ocr=ocr_results,
            metadata=metadata_results,
            forensics=forensics_results,
            qr=qr_results
        )
        
        # Combine everything
        return {
            "trust_score": risk_results["trust_score"],
            "risk_category": risk_results["risk_category"],
            "confidence_score": risk_results["confidence_score"],
            "ocr_results": ocr_results,
            "metadata_results": metadata_results,
            "forensics_results": forensics_results,
            "qr_results": qr_results,
            "scoring_factors": risk_results["scoring_factors"],
            "overall_explanation": risk_results["overall_explanation"],
            "recommendation": risk_results["recommendation"],
            "forensic_overlay_path": forensics_results.get("ela_overlay_url") # Map relative static URL
        }
