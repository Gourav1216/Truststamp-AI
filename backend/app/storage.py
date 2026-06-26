import os
import uuid
import shutil
from fastapi import UploadFile
from backend.app.config import settings

class SecureStorage:
    @staticmethod
    def save_upload(file: UploadFile) -> tuple[str, str]:
        """
        Saves an uploaded file to the secure upload directory.
        Returns a tuple of (saved_file_path, relative_url_path).
        """
        # Clean file extension
        _, ext = os.path.splitext(file.filename)
        ext = ext.lower()
        
        # Avoid directories in names, generate a unique secure name
        secure_name = f"{uuid.uuid4()}{ext}"
        target_path = os.path.join(settings.UPLOAD_DIR, secure_name)
        
        # Save file to disk
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return target_path, f"/static/{secure_name}"

    @staticmethod
    def get_overlay_path(filename: str) -> tuple[str, str]:
        """
        Returns full file path and relative static URL for a forensic overlay image.
        """
        overlay_name = f"overlay_{filename}"
        target_path = os.path.join(settings.OVERLAY_DIR, overlay_name)
        return target_path, f"/static/overlays/{overlay_name}"

    @staticmethod
    def delete_file(file_path: str) -> None:
        """
        Deletes a file from storage if it exists.
        """
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
