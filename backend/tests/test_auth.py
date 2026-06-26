import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.auth import get_password_hash, verify_password, create_access_token
from backend.app.config import settings
from jose import jwt

def test_password_hashing():
    pw = "my_secure_password"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_generation():
    payload = {"sub": "user_12345"}
    token = create_access_token(payload)
    assert token is not None
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "user_12345"
    assert "exp" in decoded
