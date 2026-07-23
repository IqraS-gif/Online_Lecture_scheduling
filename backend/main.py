import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import auth, users, courses, lectures

load_dotenv()

app = FastAPI(
    title="Online Lecture Scheduling API",
    description="Backend for the lecture scheduling module — conflict-safe scheduling with Firebase and Cloudinary.",
    version="1.0.0",
)

# CORS — allow the React frontend (set FRONTEND_ORIGIN in production env vars)
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(lectures.router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "Lecture Scheduling API is running"}
