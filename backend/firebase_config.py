import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

_db = None

def get_db():
    global _db
    if _db is None:
        if not firebase_admin._apps:
            # Prefer inline JSON or base64 (for Render production env var)
            firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
            if firebase_creds_json:
                raw_str = firebase_creds_json.strip()
                if raw_str.startswith("{"):
                    cred_dict = json.loads(raw_str)
                else:
                    # Attempt Base64 decoding
                    try:
                        decoded = base64.b64decode(raw_str).decode("utf-8")
                        cred_dict = json.loads(decoded)
                    except Exception as e:
                        raise ValueError(f"Failed to parse FIREBASE_CREDENTIALS_JSON: {e}")
                cred = credentials.Certificate(cred_dict)
            else:
                # Fallback: file path (for local dev)
                creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
                if not creds_path:
                    raise RuntimeError(
                        "Neither FIREBASE_CREDENTIALS_JSON nor FIREBASE_CREDENTIALS_PATH is set."
                    )
                cred = credentials.Certificate(creds_path)
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db
