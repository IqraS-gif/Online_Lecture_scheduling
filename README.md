# Online Lecture Scheduling Module

A full-stack lecture scheduling system with **React + FastAPI + Firebase Firestore + Cloudinary**.

---

## Quick Start

### 1. Fill in environment variables

**`backend/.env`** — add your Cloudinary credentials:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**`frontend/.env`** — add your Firebase Web App config:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=lecschedule.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lecschedule
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 2. Start the backend

```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at: http://localhost:8000
Docs: http://localhost:8000/docs

### 3. Seed users (first time only)

```powershell
# In a new terminal:
curl -X POST http://localhost:8000/users/seed
```

This creates:
- **Admin**: admin@lecschedule.com / Password@123
- **Instructors**: rahul, priya, aman, sneha, rohan @lecschedule.com / Password@123

### 4. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Project Structure

```
Online_course_management/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── firebase_config.py   # Firebase Admin SDK init
│   ├── .env                 # Credentials (do not commit)
│   ├── requirements.txt
│   ├── models/              # Pydantic models
│   └── routers/             # API route handlers
│       ├── auth.py          # Token verification
│       ├── users.py         # Instructors list + seed
│       ├── courses.py       # Course CRUD + Cloudinary
│       └── lectures.py      # Lecture CRUD + conflict check
│
├── frontend/
│   ├── src/
│   │   ├── pages/admin/     # Dashboard, Courses, AddCourse, CourseDetail
│   │   ├── pages/instructor/ # MyLectures
│   │   ├── components/      # Sidebar, Layouts
│   │   ├── context/AuthContext.jsx
│   │   └── index.css        # Full design system
│   └── .env                 # Vite env vars (do not commit)
│
└── lecschedule-firebase-adminsdk-fbsvc-8fc9c150f6.json
```

---

## Conflict Checking

When the admin tries to schedule a lecture:

1. The backend queries the `schedules` Firestore collection:
   `instructorId == selected AND date == selectedDate`
2. If a document exists → HTTP 409 with instructor name and date in the error message
3. The frontend displays this error **inline in the modal** (no page reload)
4. If no conflict → lecture is created in `lectures` collection AND a fast-lookup entry is added to `schedules`

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | Admin + Instructor accounts (role field) |
| `courses` | Course metadata + Cloudinary image URL |
| `lectures` | Individual lectures/batches |
| `schedules` | Denormalized index for fast conflict lookups |
