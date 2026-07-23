from pydantic import BaseModel
from typing import Optional


class CourseCreate(BaseModel):
    name: str
    level: str       # "Beginner" | "Intermediate" | "Advanced"
    description: str


class CourseOut(BaseModel):
    id: str
    name: str
    level: str
    description: str
    imageUrl: Optional[str] = None
    createdAt: Optional[str] = None
