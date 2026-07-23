<div align="center">

  # 🎓 LecSchedule — Online Lecture & Course Management System

  **A conflict-free, intelligent lecture scheduling platform for educational institutions and online learning platforms.**

  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109.x-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://online-lecture-scheduling-nine.vercel.app)
  [![Render](https://img.shields.io/badge/Render-Backend_Live-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://online-lecture-scheduling-b8nv.onrender.com)

  <br />

  [🌐 **Live Web Application**](https://online-lecture-scheduling-nine.vercel.app) • [⚡ **Live API Documentation**](https://online-lecture-scheduling-b8nv.onrender.com/docs)

</div>

---

## 🌟 Overview

**LecSchedule** simplifies course administration and instructor scheduling. Built using **React (Vite)**, **FastAPI**, **Firebase Firestore**, and **Cloudinary**, it automatically detects and prevents scheduling conflicts, ensuring that no instructor is assigned multiple lectures on the same date.

Whether you're managing multiple batches or tracking individual instructor agendas, **LecSchedule** provides an intuitive, high-performance workspace for admins and instructors alike.

---

## ✨ Key Features

### 🛡️ Dual Portal Access (Role-Based Control)
- **Admin Portal**: Complete control over course creation, image uploads, lecture scheduling, and instructor tracking.
- **Instructor Portal**: Personalized dashboard and calendar view showing assigned lectures, dates, times, and batch details.

### 🛑 Smart Conflict Detection Engine
- Enforces scheduling rules: **An instructor can only be assigned to a single lecture per date**.
- Instant conflict check during scheduling: returns `HTTP 409` with clear error explanations.
- Real-time popup resolution without breaking form state or reloading the page.

### ⚡ Centralized In-Memory Caching (DataCacheContext)
- Zero-dependency, TTL-based caching layer in React Context.
- Instant page transitions with zero spinner flickering.
- Automatic invalidation on mutation: adding or deleting a course/lecture immediately updates all connected components across the app.

### 🖼️ Cloud-Based Media Storage
- Seamless image uploading via **Cloudinary API**.
- Automatic fallback image placeholders for courses without custom covers.

### 📅 Interactive Monthly Calendar Views
- Full visual calendar grid for both Admins and Instructors.
- Clickable date cells to inspect scheduled lectures by day.
- Past-time check: prevents scheduling lectures in the past for today's date.

---

## 🚀 Live Demo & Credentials

- **Frontend App (Vercel)**: [https://online-lecture-scheduling-nine.vercel.app](https://online-lecture-scheduling-nine.vercel.app)
- **Backend API (Render)**: [https://online-lecture-scheduling-b8nv.onrender.com](https://online-lecture-scheduling-b8nv.onrender.com)
- **API Swagger Docs**: [https://online-lecture-scheduling-b8nv.onrender.com/docs](https://online-lecture-scheduling-b8nv.onrender.com/docs)

### 🔑 Demo Login Accounts

| Role | Portal | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Admin Portal | `admin@lecschedule.com` | `Password@123` |
| **Instructor** | Instructor Portal | `rahul@lecschedule.com` | `Password@123` |
| **Instructor** | Instructor Portal | `priya@lecschedule.com` | `Password@123` |
| **Instructor** | Instructor Portal | `aman@lecschedule.com` | `Password@123` |

*(Note: Clicking any demo button on the login screen automatically populates the form).*

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite), JavaScript | Single Page Application framework |
| **Styling** | Custom Design Tokens (Vanilla CSS) | Warm, glassmorphism UI with micro-animations |
| **Icons & Alerts** | Lucide React, React Hot Toast | Modern UI iconography & notifications |
| **Backend** | Python 3.11+, FastAPI | Asynchronous RESTful API framework |
| **Database** | Firebase Firestore | NoSQL Cloud Database |
| **Authentication** | Firebase Admin SDK + Client Auth | Token verification & user security |
| **Image Hosting** | Cloudinary API | Cloud storage for course thumbnails |
| **Hosting** | Vercel (Frontend) & Render (Backend) | Global CI/CD deployment |

---

## 📂 Project Structure

```text
Online_course_management/
├── backend/
│   ├── main.py              # FastAPI entry point & CORS configuration
│   ├── firebase_config.py   # Firebase Admin SDK initialization (JSON / Base64)
│   ├── requirements.txt     # Python backend dependencies
│   ├── models/              # Pydantic data schemas
│   │   ├── course.py
│   │   ├── lecture.py
│   │   └── user.py
│   └── routers/             # API Router modules
│       ├── auth.py          # Token verification endpoint (/auth/verify-token)
│       ├── users.py         # Instructor accounts & database seed (/users/seed)
│       ├── courses.py       # Course CRUD & Cloudinary file upload
│       └── lectures.py      # Lecture management & conflict checking
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api.js           # Axios client configured with VITE_API_BASE_URL
│   │   ├── firebase.js      # Firebase client SDK initialization
│   │   ├── App.jsx          # Router & Protected route configuration
│   │   ├── index.css        # Core design system & theme variables
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Firebase Auth & user profile state
│   │   │   └── DataCacheContext.jsx  # In-memory TTL data cache & invalidation
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Responsive Navigation sidebar
│   │   │   └── Layout/               # Admin & Instructor layout wrappers
│   │   └── pages/
│   │       ├── Login.jsx             # Dual-portal choice & authentication
│   │       ├── admin/                # Dashboard, Courses, Instructors, Calendar
│   │       └── instructor/           # MyLectures, InstructorCalendarView
│   └── vercel.json          # SPA Client-side route rewrites
│
└── vercel.json              # Workspace root deployment rewrite rules
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **Python**: v3.10 or higher
- **Firebase Account**: Firebase project with Firestore & Auth enabled
- **Cloudinary Account**: Cloud name, API Key, and Secret

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
```

Fill in your environment variables in `backend/.env`:
```env
FIREBASE_CREDENTIALS_PATH=../data/lecschedule-firebase-adminsdk-fbsvc-8fc9c150f6.json
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_ORIGIN=http://localhost:5173
```

Start the FastAPI backend server:
```bash
uvicorn main:app --reload --port 8000
```
- API Endpoint: `http://localhost:8000`
- Interactive Documentation: `http://localhost:8000/docs`

---

### 3. Database Seeding (First Time Setup)

Run the seed command to create the default Admin and Instructor accounts in Firestore:

```bash
curl -X POST http://localhost:8000/users/seed
```

---

### 4. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Fill in your Firebase Web client configuration in `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=lecschedule.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lecschedule
VITE_FIREBASE_STORAGE_BUCKET=lecschedule.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_API_BASE_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Conflict Checking Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE as Frontend (React)
    participant BE as Backend (FastAPI)
    participant FS as Firestore DB

    Admin->>FE: Fill Lecture Form (Instructor, Date, Time)
    FE->>BE: POST /lectures (courseId, instructorId, date, time)
    BE->>FS: Query 'schedules' collection (instructorId == X & date == Y)
    
    alt Schedule Conflict Exists
        FS-->>BE: Conflict document found
        BE-->>FE: HTTP 409 Conflict ("Rahul already has a lecture on 2026-07-25")
        FE-->>Admin: Display Conflict Modal Popup
    else No Conflict
        FS-->>BE: No existing schedule
        BE->>FS: Add to 'lectures' & 'schedules' collections
        BE-->>FE: HTTP 200 Success (Lecture JSON)
        FE->>FE: Invalidate Cache ('lectures')
        FE-->>Admin: Show Success Toast & Refresh Grid
    end
```

---

## 📄 Firestore Collection Schema

| Collection | Key Fields | Description |
| :--- | :--- | :--- |
| `users` | `name`, `email`, `role`, `designation` | Accounts with roles (`admin` or `instructor`) |
| `courses` | `name`, `level`, `description`, `imageUrl` | Course details & Cloudinary thumbnail |
| `lectures` | `courseId`, `lectureTitle`, `batch`, `instructorId`, `lectureDate`, `startTime`, `endTime`, `status` | Individual lecture schedules |
| `schedules` | `instructorId`, `lectureId`, `courseId`, `date` | Fast-lookup index for conflict verification |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/IqraS-gif/Online_Lecture_scheduling/issues).

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by Iqra. Designed for clarity, speed, and reliability.</sub>
</div>
