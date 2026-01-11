from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# MongoDB client
client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Connect to MongoDB database."""
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.lookmax
    print("Connected to MongoDB")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    """Get database instance."""
    return db


# Collection helpers
def get_users_collection():
    return db.users


def get_scans_collection():
    return db.scans


def get_content_collection():
    return db.content


def get_progress_collection():
    return db.progress


def get_posts_collection():
    return db.posts


def get_messages_collection():
    return db.messages


def get_events_collection():
    return db.events
