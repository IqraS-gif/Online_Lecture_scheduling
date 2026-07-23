import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from firebase_config import get_db
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


def _serialize_course(doc) -> dict:
    data = doc.to_dict()
    data["id"] = doc.id
    if "createdAt" in data and hasattr(data["createdAt"], "isoformat"):
        data["createdAt"] = data["createdAt"].isoformat()
    return data


@router.get("")
async def get_courses():
    """Return all courses."""
    db = get_db()
    docs = db.collection("courses").order_by("createdAt", direction="DESCENDING").stream()
    return [_serialize_course(doc) for doc in docs]


@router.get("/{course_id}")
async def get_course(course_id: str):
    """Return a single course by ID."""
    db = get_db()
    doc = db.collection("courses").document(course_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Course not found")
    return _serialize_course(doc)


@router.post("")
async def create_course(
    name: str = Form(...),
    level: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(None),
):
    """Create a new course. Checks for duplicate (name + level) before creation."""
    db = get_db()
    clean_name = name.strip()
    clean_level = level.strip()

    # --- Duplicate Check (name AND level) ---
    existing_docs = (
        db.collection("courses")
        .where("name", "==", clean_name)
        .where("level", "==", clean_level)
        .stream()
    )
    if list(existing_docs):
        raise HTTPException(
            status_code=409,
            detail=f"A course with the name '{clean_name}' and level '{clean_level}' already exists.",
        )

    image_url = None

    if image and image.filename:
        contents = await image.read()
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="lecschedule/courses",
            resource_type="image",
        )
        image_url = upload_result.get("secure_url")

    course_data = {
        "name": clean_name,
        "level": clean_level,
        "description": description.strip(),
        "imageUrl": image_url,
        "createdAt": datetime.utcnow(),
    }

    _, doc_ref = db.collection("courses").add(course_data)
    return {"id": doc_ref.id, **course_data, "createdAt": course_data["createdAt"].isoformat()}


@router.put("/{course_id}")
async def update_course(
    course_id: str,
    name: str = Form(None),
    level: str = Form(None),
    description: str = Form(None),
    image: UploadFile = File(None),
):
    """Update an existing course. Only provided fields are updated."""
    db = get_db()
    doc_ref = db.collection("courses").document(course_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Course not found")

    current_data = doc_ref.get().to_dict()
    target_name = (name.strip() if name else current_data.get("name", "")).strip()
    target_level = (level.strip() if level else current_data.get("level", "")).strip()

    # Check for duplicates excluding current course
    if name or level:
        existing_docs = (
            db.collection("courses")
            .where("name", "==", target_name)
            .where("level", "==", target_level)
            .stream()
        )
        for doc in existing_docs:
            if doc.id != course_id:
                raise HTTPException(
                    status_code=409,
                    detail=f"A course with the name '{target_name}' and level '{target_level}' already exists.",
                )

    updates = {}
    if name:
        updates["name"] = target_name
    if level:
        updates["level"] = target_level
    if description:
        updates["description"] = description.strip()
    if image and image.filename:
        contents = await image.read()
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="lecschedule/courses",
            resource_type="image",
        )
        updates["imageUrl"] = upload_result.get("secure_url")

    if updates:
        doc_ref.update(updates)

    return {"id": course_id, "updated": True}


@router.delete("/{course_id}")
async def delete_course(course_id: str):
    """Delete a course and all its associated lectures + schedules."""
    db = get_db()
    doc_ref = db.collection("courses").document(course_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Course not found")

    # Delete associated lectures and their schedule entries
    lectures = db.collection("lectures").where("courseId", "==", course_id).stream()
    for lec in lectures:
        # Remove schedule entries for this lecture
        schedules = db.collection("schedules").where("lectureId", "==", lec.id).stream()
        for sch in schedules:
            db.collection("schedules").document(sch.id).delete()
        db.collection("lectures").document(lec.id).delete()

    doc_ref.delete()
    return {"id": course_id, "deleted": True}
