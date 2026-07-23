from fastapi import APIRouter, HTTPException
from firebase_config import get_db
from models.lecture import LectureCreate
from datetime import datetime

router = APIRouter(prefix="/lectures", tags=["Lectures"])


def _serialize_lecture(doc) -> dict:
    data = doc.to_dict()
    data["id"] = doc.id
    if "createdAt" in data and hasattr(data["createdAt"], "isoformat"):
        data["createdAt"] = data["createdAt"].isoformat()
    return data


def _enrich_lecture(data: dict, db) -> dict:
    """Add instructorName and courseName to a lecture dict."""
    instructor_id = data.get("instructorId")
    course_id = data.get("courseId")

    if instructor_id:
        u_doc = db.collection("users").document(instructor_id).get()
        if u_doc.exists:
            data["instructorName"] = u_doc.to_dict().get("name", "")

    if course_id:
        c_doc = db.collection("courses").document(course_id).get()
        if c_doc.exists:
            data["courseName"] = c_doc.to_dict().get("name", "")

    return data


@router.get("")
async def get_lectures(courseId: str = None):
    """
    Return all lectures, optionally filtered by courseId.
    Enriches each lecture with instructorName and courseName.
    """
    db = get_db()
    query = db.collection("lectures")
    if courseId:
        query = query.where("courseId", "==", courseId)

    docs = query.stream()
    result = []
    for doc in docs:
        data = _serialize_lecture(doc)
        data = _enrich_lecture(data, db)
        result.append(data)

    # Sort by lectureDate ascending
    result.sort(key=lambda x: x.get("lectureDate", ""))
    return result


@router.get("/instructor/{instructor_id}")
async def get_lectures_by_instructor(instructor_id: str):
    """Return all lectures assigned to a specific instructor (for instructor panel)."""
    db = get_db()
    docs = db.collection("lectures").where("instructorId", "==", instructor_id).stream()
    result = []
    for doc in docs:
        data = _serialize_lecture(doc)
        data = _enrich_lecture(data, db)
        result.append(data)

    result.sort(key=lambda x: x.get("lectureDate", ""))
    return result


@router.post("")
async def create_lecture(payload: LectureCreate):
    """
    Create a new lecture/batch.
    Enforces: an instructor cannot have more than one lecture on the same date.
    """
    db = get_db()

    # --- Conflict Check ---
    existing = (
        db.collection("schedules")
        .where("instructorId", "==", payload.instructorId)
        .where("date", "==", payload.lectureDate)
        .stream()
    )
    conflict_docs = list(existing)

    if conflict_docs:
        # Fetch instructor name for a helpful error message
        instructor_doc = db.collection("users").document(payload.instructorId).get()
        instructor_name = (
            instructor_doc.to_dict().get("name", "This instructor")
            if instructor_doc.exists
            else "This instructor"
        )
        raise HTTPException(
            status_code=409,
            detail=f"{instructor_name} already has a lecture scheduled on {payload.lectureDate}. "
                   "Please choose a different date or a different instructor.",
        )

    # --- Create Lecture ---
    lecture_data = payload.model_dump()
    lecture_data["createdAt"] = datetime.utcnow()

    _, lec_ref = db.collection("lectures").add(lecture_data)

    # --- Write Schedule Entry (fast conflict lookup) ---
    db.collection("schedules").add(
        {
            "instructorId": payload.instructorId,
            "lectureId": lec_ref.id,
            "courseId": payload.courseId,
            "date": payload.lectureDate,
            "createdAt": datetime.utcnow(),
        }
    )

    return {
        "id": lec_ref.id,
        **lecture_data,
        "createdAt": lecture_data["createdAt"].isoformat(),
    }


@router.delete("/{lecture_id}")
async def delete_lecture(lecture_id: str):
    """Delete a lecture and its schedule entry."""
    db = get_db()
    lec_ref = db.collection("lectures").document(lecture_id)
    if not lec_ref.get().exists:
        raise HTTPException(status_code=404, detail="Lecture not found")

    # Remove schedule entries for this lecture
    schedules = db.collection("schedules").where("lectureId", "==", lecture_id).stream()
    for sch in schedules:
        db.collection("schedules").document(sch.id).delete()

    lec_ref.delete()
    return {"id": lecture_id, "deleted": True}
