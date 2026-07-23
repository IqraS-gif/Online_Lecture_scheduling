from pydantic import BaseModel
from typing import Optional


class LectureCreate(BaseModel):
    courseId: str
    lectureTitle: str
    instructorId: str
    lectureDate: str     # ISO date string "YYYY-MM-DD"
    startTime: str       # "HH:MM"
    endTime: str         # "HH:MM"
    batch: str
    status: str = "Scheduled"


class LectureOut(BaseModel):
    id: str
    courseId: str
    lectureTitle: str
    instructorId: str
    instructorName: Optional[str] = None
    courseName: Optional[str] = None
    lectureDate: str
    startTime: str
    endTime: str
    batch: str
    status: str
    createdAt: Optional[str] = None
