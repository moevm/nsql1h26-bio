import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://db:27017")
DB_NAME = os.getenv("DB_NAME", "skud_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


def get_database():
    return db
