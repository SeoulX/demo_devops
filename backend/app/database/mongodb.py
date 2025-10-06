import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:root123@192.168.39.127:30017/demo_app?authSource=admin")
DATABASE_NAME = os.getenv("DATABASE_NAME", "demo_app")

# Collections
COLLECTION_USERS = "users"
COLLECTION_RECORDS = "daily_time_records"

# Initialize MongoDB client
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db[COLLECTION_USERS]
records_collection = db[COLLECTION_RECORDS]

# Create indexes for better performance
def create_indexes():
    """Create necessary indexes for the collections"""
    # Users collection indexes
    users_collection.create_index("email", unique=True)
    users_collection.create_index("role")
    
    # Records collection indexes
    records_collection.create_index([("intern_id", 1), ("date", 1)], unique=True)
    records_collection.create_index("intern_id")
    records_collection.create_index("date")
    records_collection.create_index("status")

# Initialize indexes when module is imported
create_indexes()
