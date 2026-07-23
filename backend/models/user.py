from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str  # "admin" | "instructor"


class UserCreate(UserBase):
    uid: str


class UserOut(UserBase):
    id: str
    createdAt: Optional[str] = None
