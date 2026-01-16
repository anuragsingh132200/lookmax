from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client.lookmax
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.scans.create_index("userId")
    await db.progress.create_index([("userId", 1), ("courseId", 1)], unique=True)
    
    print("Connected to MongoDB")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    return db
