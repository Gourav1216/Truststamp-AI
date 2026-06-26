import os
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

# App Imports
from backend.app.config import settings
from backend.app.database import engine, Base, get_db
from backend.app.models import User, Document, AnalysisReport, AuditLog
from backend.app.schemas import UserCreate, UserLogin, UserOut, Token, DocumentOut, AnalysisReportOut, ReportSummary
from backend.app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.app.storage import SecureStorage
from backend.app.services.pipeline import VerificationPipeline

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Explainable AI Document & Image Verification Platform API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory as static files to allow frontend access to files/overlays
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

# Pipeline instance
pipeline = VerificationPipeline()

# Helper to write audit logs
def log_action(db: Session, user_id: Optional[str], action: str, details: str = None):
    audit = AuditLog(user_id=user_id, action=action, details=details, ip_address="127.0.0.1")
    db.add(audit)
    db.commit()

# --- AUTH ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_action(db, user.id, "REGISTER", "New user registered successfully")
    return user

@app.post(f"{settings.API_V1_STR}/auth/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.id})
    log_action(db, user.id, "LOGIN", "User logged in")
    return {"access_token": access_token, "token_type": "bearer"}

@app.get(f"{settings.API_V1_STR}/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# --- VERIFICATION ENDPOINTS ---

@app.post(f"{settings.API_V1_STR}/verify/upload", response_model=AnalysisReportOut, status_code=status.HTTP_201_CREATED)
async def upload_and_verify(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate mime types
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and PDF files are allowed")

    # Read size to prevent huge files (10MB limit for demo safety)
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 10MB limit")

    # Save file to secure storage
    file_path, file_url = SecureStorage.save_upload(file)

    try:
        # Create Document record
        doc = Document(
            user_id=current_user.id,
            file_name=file.filename,
            file_path=file_path,
            mime_type=file.content_type,
            file_size=size
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Run AI Forensic Pipeline
        results = pipeline.analyze_document(file_path, file.content_type)

        # Save Analysis Report
        report = AnalysisReport(
            document_id=doc.id,
            trust_score=results["trust_score"],
            risk_category=results["risk_category"],
            confidence_score=results["confidence_score"],
            ocr_results=results["ocr_results"],
            metadata_results=results["metadata_results"],
            forensics_results=results["forensics_results"],
            qr_results=results["qr_results"],
            scoring_factors=results["scoring_factors"],
            overall_explanation=results["overall_explanation"],
            recommendation=results["recommendation"],
            forensic_overlay_path=results["forensic_overlay_path"]
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        log_action(db, current_user.id, "VERIFY_UPLOAD", f"Uploaded and analyzed: {file.filename}. Score: {results['trust_score']}")
        return report

    except Exception as e:
        # Clean up saved file if processing crashed
        SecureStorage.delete_file(file_path)
        log_action(db, current_user.id, "VERIFY_FAILED", f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")


# --- HISTORY & REPORT ENDPOINTS ---

@app.get(f"{settings.API_V1_STR}/reports", response_model=List[ReportSummary])
def list_reports(
    search: Optional[str] = Query(None),
    risk: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(
        AnalysisReport.id,
        AnalysisReport.document_id,
        Document.file_name,
        Document.file_size,
        Document.uploaded_at,
        AnalysisReport.trust_score,
        AnalysisReport.risk_category,
        AnalysisReport.completed_at
    ).join(Document, Document.id == AnalysisReport.document_id)\
     .filter(Document.user_id == current_user.id)

    if search:
        query = query.filter(Document.file_name.ilike(f"%{search}%"))
    if risk:
        query = query.filter(AnalysisReport.risk_category == risk)

    # Sort newest first
    results = query.order_by(Document.uploaded_at.desc()).all()
    
    # Map to schema objects
    reports = []
    for r in results:
        reports.append(ReportSummary(
            id=r.id,
            document_id=r.document_id,
            file_name=r.file_name,
            file_size=r.file_size,
            uploaded_at=r.uploaded_at,
            trust_score=r.trust_score,
            risk_category=r.risk_category,
            completed_at=r.completed_at
        ))
    return reports

@app.get(f"{settings.API_V1_STR}/reports/{{report_id}}", response_model=AnalysisReportOut)
def get_report(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(AnalysisReport).join(Document, Document.id == AnalysisReport.document_id)\
               .filter(AnalysisReport.id == report_id, Document.user_id == current_user.id).first()
               
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.delete(f"{settings.API_V1_STR}/reports/{{report_id}}", status_code=status.HTTP_200_OK)
def delete_report(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(AnalysisReport).join(Document, Document.id == AnalysisReport.document_id)\
               .filter(AnalysisReport.id == report_id, Document.user_id == current_user.id).first()
               
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    doc = report.document
    file_path = doc.file_path
    ela_path = None
    if report.forensic_overlay_path:
        # Convert static URL back to local path
        filename = os.path.basename(report.forensic_overlay_path)
        ela_path = os.path.join(settings.OVERLAY_DIR, filename)

    # Delete records from DB
    db.delete(report)
    db.delete(doc)
    db.commit()

    # Delete files from disk
    SecureStorage.delete_file(file_path)
    if ela_path:
        SecureStorage.delete_file(ela_path)
        # Check alignment overlay
        align_filename = "align_" + os.path.basename(file_path)
        SecureStorage.delete_file(os.path.join(settings.OVERLAY_DIR, align_filename))

    log_action(db, current_user.id, "DELETE_REPORT", f"Deleted report: {report_id} and corresponding files.")
    return {"message": "Report deleted successfully"}
