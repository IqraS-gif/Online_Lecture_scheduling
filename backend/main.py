import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from routers import auth, users, courses, lectures

load_dotenv()

app = FastAPI(
    title="Online Lecture Scheduling API",
    description="Backend for the lecture scheduling module — conflict-safe scheduling with Firebase and Cloudinary.",
    version="1.0.0",
)

# CORS — allow React frontend (supports localhost, custom origins, and all *.vercel.app preview URLs)
raw_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173,https://online-lecture-scheduling-nine.vercel.app")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler — ensures CORS headers are present even on 500 errors.
# Without this, a server crash causes the browser to report a "CORS error" instead
# of the actual internal error.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    headers = {}
    if any(o in origin for o in origins) or (origin and origin.endswith(".vercel.app")):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {exc}"},
        headers=headers,
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
