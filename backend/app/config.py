import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "TrustStamp AI"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(default="super_secret_key_for_hackathon_demo_truststamp_123!@#", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo ease
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./truststamp.db", env="DATABASE_URL")
    
    # Upload paths (all created relative to workspace root or in current directory)
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    OVERLAY_DIR: str = Field(default="uploads/overlays", env="OVERLAY_DIR")
    
    # Tesseract path override (if needed on Windows)
    TESSERACT_CMD: str = Field(default="", env="TESSERACT_CMD")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OVERLAY_DIR, exist_ok=True)
