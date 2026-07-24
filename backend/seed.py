"""
Database Seeding Script for LecSchedule (Firebase Firestore & Auth)
Run this script to initialize sample Admin, Instructors, Courses, and Lectures:
    python backend/seed.py
"""

import sys
import os
from datetime import datetime

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from firebase_config import get_db
from firebase_admin import auth as firebase_auth


def seed_database():
    print("🌱 Initializing Firebase Admin SDK & Firestore Connection...")
    db = get_db()
    print("✅ Firebase initialized.\n")

    # ---------------------------------------------------------
    # 1. Seed Users (Admin + Instructors)
    # ---------------------------------------------------------
    print("👥 Seeding Users in Firebase Auth & Firestore...")
    all_users = [
        {"name": "Admin", "email": "admin@lecschedule.com", "role": "admin", "designation": "Administrator"},
        {"name": "Rahul Sharma", "email": "rahul@lecschedule.com", "role": "instructor", "designation": "Frontend Development Teacher"},
        {"name": "Priya Mehta", "email": "priya@lecschedule.com", "role": "instructor", "designation": "System Design Teacher"},
        {"name": "Aman Khan", "email": "aman@lecschedule.com", "role": "instructor", "designation": "Backend Development Teacher"},
        {"name": "Sneha Iyer", "email": "sneha@lecschedule.com", "role": "instructor", "designation": "Data Structures & Algorithms Teacher"},
        {"name": "Rohan Verma", "email": "rohan@lecschedule.com", "role": "instructor", "designation": "Cloud & DevOps Teacher"},
    ]

    user_map = {}  # email -> uid

    for u in all_users:
        try:
            fb_user = firebase_auth.create_user(
                email=u["email"],
                password="Password@123",
                display_name=u["name"],
            )
            uid = fb_user.uid
            print(f"  + Created Auth User: {u['email']} (UID: {uid})")
        except Exception:
            fb_user = firebase_auth.get_user_by_email(u["email"])
            uid = fb_user.uid
            print(f"  ~ Auth User Exists: {u['email']} (UID: {uid})")

        user_map[u["email"]] = uid

        db.collection("users").document(uid).set({
            "name": u["name"],
            "email": u["email"],
            "role": u["role"],
            "designation": u.get("designation", ""),
            "createdAt": datetime.utcnow(),
        }, merge=True)

    print("✅ Users seeded successfully.\n")

    # ---------------------------------------------------------
    # 2. Seed Sample Courses
    # ---------------------------------------------------------
    print("📚 Seeding Sample Courses...")
    sample_courses = [
        {
            "id": "course_web_dev",
            "name": "Full Stack Web Development",
            "level": "Intermediate",
            "description": "Master modern web development with React, Node.js, FastAPI, and database integration.",
            "imageUrl": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop",
        },
        {
            "id": "course_sys_design",
            "name": "System Design & Architecture",
            "level": "Advanced",
            "description": "Learn high-scalability architecture, microservices, load balancing, and distributed databases.",
            "imageUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop",
        },
        {
            "id": "course_dsa",
            "name": "Data Structures & Algorithms",
            "level": "Beginner",
            "description": "Comprehensive guide to problem-solving, tree/graph algorithms, dynamic programming, and complexity analysis.",
            "imageUrl": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop",
        },
    ]

    for c in sample_courses:
        doc_id = c["id"]
        c_data = {k: v for k, v in c.items() if k != "id"}
        c_data["createdAt"] = datetime.utcnow()
        db.collection("courses").document(doc_id).set(c_data, merge=True)
        print(f"  + Seeded Course: {c['name']} (ID: {doc_id})")

    print("✅ Courses seeded successfully.\n")

    # ---------------------------------------------------------
    # 3. Seed Sample Lectures & Conflict Indexes
    # ---------------------------------------------------------
    print("📅 Seeding Sample Lectures & Schedules...")
    sample_lectures = [
        {
            "id": "lec_001",
            "courseId": "course_web_dev",
            "lectureTitle": "React Hooks & State Management",
            "batch": "Batch A (Morning)",
            "instructorId": user_map["rahul@lecschedule.com"],
            "lectureDate": "2026-07-25",
            "startTime": "10:00",
            "endTime": "12:00",
            "status": "Scheduled",
        },
        {
            "id": "lec_002",
            "courseId": "course_sys_design",
            "lectureTitle": "Microservices & Message Queues",
            "batch": "Batch B (Evening)",
            "instructorId": user_map["priya@lecschedule.com"],
            "lectureDate": "2026-07-26",
            "startTime": "14:00",
            "endTime": "16:00",
            "status": "Scheduled",
        },
        {
            "id": "lec_003",
            "courseId": "course_dsa",
            "lectureTitle": "Dynamic Programming & Optimization",
            "batch": "Batch A (Morning)",
            "instructorId": user_map["sneha@lecschedule.com"],
            "lectureDate": "2026-07-27",
            "startTime": "11:00",
            "endTime": "13:00",
            "status": "Scheduled",
        },
    ]

    for lec in sample_lectures:
        lec_id = lec["id"]
        lec_data = {k: v for k, v in lec.items() if k != "id"}
        lec_data["createdAt"] = datetime.utcnow()
        db.collection("lectures").document(lec_id).set(lec_data, merge=True)

        # Seed corresponding schedule index entry
        sch_id = f"sch_{lec_id}"
        db.collection("schedules").document(sch_id).set({
            "instructorId": lec["instructorId"],
            "lectureId": lec_id,
            "courseId": lec["courseId"],
            "date": lec["lectureDate"],
            "createdAt": datetime.utcnow(),
        }, merge=True)
        print(f"  + Seeded Lecture: {lec['lectureTitle']} ({lec['lectureDate']})")

    print("✅ Lectures & Schedules seeded successfully.\n")
    print("🎉 Database seeding complete! You can now log into Admin & Instructor portals.")


if __name__ == "__main__":
    seed_database()
