import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="documents")
    report = relationship("AnalysisReport", back_populates="document", uselist=False, cascade="all, delete-orphan")

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    trust_score = Column(Integer, nullable=False)
    risk_category = Column(String(50), nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    # Store forensic sub-pipeline outputs as JSON
    ocr_results = Column(JSON, nullable=False)
    metadata_results = Column(JSON, nullable=False)
    forensics_results = Column(JSON, nullable=False)
    qr_results = Column(JSON, nullable=False)
    scoring_factors = Column(JSON, nullable=False)
    
    overall_explanation = Column(Text, nullable=False)
    recommendation = Column(String(255), nullable=False)
    forensic_overlay_path = Column(String(512), nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("Document", back_populates="report")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=False)
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="audit_logs")
