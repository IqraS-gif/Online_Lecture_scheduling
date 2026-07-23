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
raw_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173,https://online-lecture-scheduling-nine.vercel.app")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(lectures.router)

@app.on_event("startup")
def startup_event():
    try:
        from firebase_config import get_db
        get_db()
        print("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"Error initializing Firebase on startup: {e}")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Lecture Scheduling API is running"}
