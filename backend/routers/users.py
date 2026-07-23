from fastapi import APIRouter, HTTPException
from firebase_config import get_db
from firebase_admin import auth as firebase_auth
from datetime import datetime
import traceback

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/instructors")
async def get_instructors():
    """Return all users with role == instructor."""
    db = get_db()
    docs = db.collection("users").where("role", "==", "instructor").stream()
    instructors = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        if "createdAt" in data and hasattr(data["createdAt"], "isoformat"):
            data["createdAt"] = data["createdAt"].isoformat()
        instructors.append(data)
    return instructors


@router.post("/seed")
async def seed_instructors():
    """
    Seed sample instructor accounts in Firebase Auth + Firestore.
    Safe to call multiple times — skips existing users.
    """
    # Initialize Firebase first
    db = get_db()

    sample_instructors = [
        {"name": "Rahul Sharma",  "email": "rahul@lecschedule.com",  "role": "instructor", "designation": "Frontend Development Teacher"},
        {"name": "Priya Mehta",   "email": "priya@lecschedule.com",  "role": "instructor", "designation": "System Design Teacher"},
        {"name": "Aman Khan",     "email": "aman@lecschedule.com",   "role": "instructor", "designation": "Backend Development Teacher"},
        {"name": "Sneha Iyer",    "email": "sneha@lecschedule.com",  "role": "instructor", "designation": "Data Structures & Algorithms Teacher"},
        {"name": "Rohan Verma",   "email": "rohan@lecschedule.com",  "role": "instructor", "designation": "Cloud & DevOps Teacher"},
    ]
    admin_user = {"name": "Admin", "email": "admin@lecschedule.com", "role": "admin", "designation": "Administrator"}
    all_users = [admin_user] + sample_instructors

    created = []
    errors = []

    for user in all_users:
        try:
            # Try creating the user in Firebase Auth
            try:
                firebase_user = firebase_auth.create_user(
                    email=user["email"],
                    password="Password@123",
                    display_name=user["name"],
                )
                uid = firebase_user.uid
                action = "created"
            except Exception as e:
                err_str = str(e).lower()
                # If the user already exists, just look them up
                if "email already exists" in err_str or "email_already_exists" in err_str or "already-exists" in err_str:
                    firebase_user = firebase_auth.get_user_by_email(user["email"])
                    uid = firebase_user.uid
                    action = "already_exists"
                else:
                    raise

            # Write / overwrite Firestore document with user data
            db.collection("users").document(uid).set(
                {
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "designation": user.get("designation", ""),
                    "createdAt": datetime.utcnow(),
                }
            )
            created.append({"uid": uid, "action": action, **user})

        except Exception as e:
            tb = traceback.format_exc()
            errors.append({
                "email": user["email"],
                "error": str(e),
                "traceback": tb,
            })

    if errors and not created:
        # All users failed — return a 500 with the actual error detail
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Seeding failed for all users. See errors for details.",
                "errors": errors,
            },
        )

    return {
        "seeded": created,
        "errors": errors,
    }
