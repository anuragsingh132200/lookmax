"""
Database seeding script for LookMax app.
Run this to populate initial data including admin user and sample courses.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/lookmax")


async def seed_database():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.lookmax
    
    print("Seeding database...")
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@lookmax.com"})
    if not admin_exists:
        admin_user = {
            "email": "admin@lookmax.com",
            "name": "Admin",
            "password": pwd_context.hash("admin123"),
            "onboarding": {},
            "subscription": {"status": "active"},
            "isOnboarded": True,
            "hasCompletedFirstScan": True,
            "isAdmin": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        await db.users.insert_one(admin_user)
        print("Created admin user: admin@lookmax.com / admin123")
    else:
        print("Admin user already exists")
    
    # Create sample course
    course_exists = await db.courses.find_one({"title": "The Ultimate GlowUp Guide"})
    if not course_exists:
        sample_course = {
            "title": "The Ultimate GlowUp Guide",
            "description": "A comprehensive course on improving your overall appearance through skincare, grooming, and lifestyle changes.",
            "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
            "modules": [
                {
                    "_id": "module-1",
                    "title": "Skincare Fundamentals",
                    "description": "Learn the basics of a proper skincare routine",
                    "order": 0,
                    "chapters": [
                        {
                            "_id": "chapter-1-1",
                            "title": "Understanding Your Skin Type",
                            "type": "video",
                            "content": "https://example.com/videos/skin-type.mp4",
                            "duration": 600,
                            "order": 0
                        },
                        {
                            "_id": "chapter-1-2",
                            "title": "Building Your Routine",
                            "type": "video",
                            "content": "https://example.com/videos/routine.mp4",
                            "duration": 900,
                            "order": 1
                        },
                        {
                            "_id": "chapter-1-3",
                            "title": "Product Guide",
                            "type": "image",
                            "content": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
                            "duration": 0,
                            "order": 2
                        }
                    ]
                },
                {
                    "_id": "module-2",
                    "title": "Facial Structure Enhancement",
                    "description": "Techniques to enhance your facial features",
                    "order": 1,
                    "chapters": [
                        {
                            "_id": "chapter-2-1",
                            "title": "Mewing Basics",
                            "type": "video",
                            "content": "https://example.com/videos/mewing.mp4",
                            "duration": 720,
                            "order": 0
                        },
                        {
                            "_id": "chapter-2-2",
                            "title": "Facial Exercises",
                            "type": "video",
                            "content": "https://example.com/videos/exercises.mp4",
                            "duration": 540,
                            "order": 1
                        }
                    ]
                },
                {
                    "_id": "module-3",
                    "title": "Grooming & Styling",
                    "description": "Master the art of grooming",
                    "order": 2,
                    "chapters": [
                        {
                            "_id": "chapter-3-1",
                            "title": "Hairstyle Selection",
                            "type": "video",
                            "content": "https://example.com/videos/hair.mp4",
                            "duration": 840,
                            "order": 0
                        },
                        {
                            "_id": "chapter-3-2",
                            "title": "Eyebrow Grooming",
                            "type": "video",
                            "content": "https://example.com/videos/eyebrows.mp4",
                            "duration": 480,
                            "order": 1
                        },
                        {
                            "_id": "chapter-3-3",
                            "title": "Beard Care (if applicable)",
                            "type": "video",
                            "content": "https://example.com/videos/beard.mp4",
                            "duration": 600,
                            "order": 2
                        }
                    ]
                }
            ],
            "isActive": True,
            "totalDuration": 4680,
            "totalChapters": 8,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        await db.courses.insert_one(sample_course)
        print("Created sample course: The Ultimate GlowUp Guide")
    else:
        print("Sample course already exists")
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.scans.create_index("userId")
    await db.progress.create_index([("userId", 1), ("courseId", 1)], unique=True)
    print("Created database indexes")
    
    print("Database seeding complete!")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
