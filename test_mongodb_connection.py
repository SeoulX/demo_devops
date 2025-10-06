#!/usr/bin/env python3
"""
Test script to verify MongoDB connection for the backend
"""
import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_mongodb_connection():
    """Test MongoDB connection and basic operations"""
    
    # Get MongoDB URL from environment or use default
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://admin:root123@192.168.39.127:30017/demo_app?authSource=admin")
    database_name = os.getenv("DATABASE_NAME", "demo_app")
    
    print("🔍 Testing MongoDB Connection...")
    print(f"📡 MongoDB URL: {mongodb_url}")
    print(f"🗄️  Database: {database_name}")
    print("-" * 50)
    
    try:
        # Test connection
        print("1️⃣  Testing connection...")
        client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
        
        # Test server selection
        client.server_info()
        print("✅ Connection successful!")
        
        # Test database access
        print("2️⃣  Testing database access...")
        db = client[database_name]
        print(f"✅ Database '{database_name}' accessible!")
        
        # Test collections
        print("3️⃣  Testing collections...")
        collections = db.list_collection_names()
        print(f"📋 Available collections: {collections}")
        
        # Test users collection
        print("4️⃣  Testing users collection...")
        users_collection = db["users"]
        user_count = users_collection.count_documents({})
        print(f"👥 Users count: {user_count}")
        
        # Test records collection
        print("5️⃣  Testing daily_time_records collection...")
        records_collection = db["daily_time_records"]
        records_count = records_collection.count_documents({})
        print(f"📊 Records count: {records_count}")
        
        # Test indexes
        print("6️⃣  Testing indexes...")
        user_indexes = users_collection.list_indexes()
        print("📇 Users collection indexes:")
        for index in user_indexes:
            print(f"   - {index['name']}: {index['key']}")
        
        records_indexes = records_collection.list_indexes()
        print("📇 Records collection indexes:")
        for index in records_indexes:
            print(f"   - {index['name']}: {index['key']}")
        
        # Test insert operation
        print("7️⃣  Testing insert operation...")
        test_user = {
            "email": "test@connection.com",
            "name": "Test",
            "surname": "Connection",
            "role": "Intern",
            "password": "hashed_password",
            "approval": "Pending",
            "created_at": "2024-01-01T00:00:00Z"
        }
        
        # Check if test user already exists
        existing = users_collection.find_one({"email": "test@connection.com"})
        if existing:
            print("ℹ️  Test user already exists, skipping insert")
        else:
            result = users_collection.insert_one(test_user)
            print(f"✅ Test user inserted with ID: {result.inserted_id}")
        
        # Test find operation
        print("8️⃣  Testing find operation...")
        found_user = users_collection.find_one({"email": "test@connection.com"})
        if found_user:
            print("✅ Find operation successful!")
            print(f"   Found user: {found_user['name']} {found_user['surname']}")
        
        # Clean up test data
        print("9️⃣  Cleaning up test data...")
        users_collection.delete_one({"email": "test@connection.com"})
        print("✅ Test data cleaned up!")
        
        print("\n🎉 All tests passed! MongoDB connection is working perfectly!")
        return True
        
    except ConnectionFailure as e:
        print(f"❌ Connection failed: {e}")
        return False
    except ServerSelectionTimeoutError as e:
        print(f"❌ Server selection timeout: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        try:
            client.close()
            print("🔌 Connection closed")
        except:
            pass

def test_backend_imports():
    """Test if backend can import MongoDB modules"""
    print("\n🔍 Testing backend imports...")
    
    try:
        # Add backend to path
        sys.path.append('backend')
        
        # Test MongoDB connection import
        from app.database.mongodb import users_collection, records_collection
        print("✅ MongoDB connection module imported successfully!")
        
        # Test collections
        print(f"✅ Users collection: {users_collection.name}")
        print(f"✅ Records collection: {records_collection.name}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 MongoDB Connection Test for Demo DevOps Backend")
    print("=" * 60)
    
    # Test 1: Direct MongoDB connection
    connection_ok = test_mongodb_connection()
    
    # Test 2: Backend imports
    imports_ok = test_backend_imports()
    
    print("\n" + "=" * 60)
    print("📊 Test Results:")
    print(f"   MongoDB Connection: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"   Backend Imports: {'✅ PASS' if imports_ok else '❌ FAIL'}")
    
    if connection_ok and imports_ok:
        print("\n🎉 All tests passed! Your backend is ready to use MongoDB!")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        sys.exit(1)
