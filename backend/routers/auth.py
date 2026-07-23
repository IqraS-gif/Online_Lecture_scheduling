from fastapi import APIRouter, HTTPException
from firebase_admin import auth as firebase_auth
from firebase_config import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/verify-token")
async def verify_token(payload: dict):
    """
    Verify a Firebase ID token sent from the frontend.
    Returns the user's role from Firestore.
    """
    id_token = payload.get("idToken")
    if not id_token:
        raise HTTPException(status_code=400, detail="idToken is required")

    db = get_db()
    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}")

    uid = decoded["uid"]
    user_doc = db.collection("users").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found in Firestore")

    user_data = user_doc.to_dict()
    return {
        "uid": uid,
        "name": user_data.get("name"),
        "email": user_data.get("email"),
        "role": user_data.get("role"),
    }
