from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# --- Report & File Schemas ---
class DocumentOut(BaseModel):
    id: str
    user_id: str
    file_name: str
    mime_type: str
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

class AnalysisReportOut(BaseModel):
    id: str
    document_id: str
    trust_score: int
    risk_category: str
    confidence_score: float
    ocr_results: Dict[str, Any]
    metadata_results: Dict[str, Any]
    forensics_results: Dict[str, Any]
    qr_results: Dict[str, Any]
    scoring_factors: List[Dict[str, Any]]
    overall_explanation: str
    recommendation: str
    forensic_overlay_path: Optional[str] = None
    completed_at: datetime

    class Config:
        from_attributes = True

class ReportSummary(BaseModel):
    id: str
    document_id: str
    file_name: str
    file_size: int
    uploaded_at: datetime
    trust_score: int
    risk_category: str
    completed_at: datetime

    class Config:
        from_attributes = True
