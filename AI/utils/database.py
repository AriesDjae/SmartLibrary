from pymongo import MongoClient
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseConnection:
    """Singleton class untuk mengelola koneksi database"""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self._setup_connection()
    
    def _setup_connection(self):
        """Setup koneksi database"""
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            raise ValueError("MONGODB_URI tidak ditemukan di environment variables")
        
        self._client = MongoClient(mongodb_uri)
        self.db = self._client['smartlibrary']
    
    def get_collection(self, collection_name: str):
        """Mendapatkan collection dari database"""
        return self.db[collection_name]
    
    def close_connection(self):
        """Menutup koneksi database"""
        if self._client:
            self._client.close()
            self._client = None
    
    def __del__(self):
        """Cleanup saat object dihapus"""
        self.close_connection()

class DatabaseManager:
    """Manager class untuk operasi database yang umum"""
    
    def __init__(self):
        self.db_connection = DatabaseConnection()
    
    def insert_document(self, collection_name: str, document: dict) -> Optional[str]:
        """Insert dokumen ke collection"""
        try:
            collection = self.db_connection.get_collection(collection_name)
            result = collection.insert_one(document)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error inserting document: {str(e)}")
            return None
    
    def find_documents(self, collection_name: str, query: dict = None, limit: int = None):
        """Find dokumen dari collection"""
        try:
            collection = self.db_connection.get_collection(collection_name)
            cursor = collection.find(query or {})
            if limit:
                cursor = cursor.limit(limit)
            return list(cursor)
        except Exception as e:
            print(f"Error finding documents: {str(e)}")
            return []
    
    def find_one_document(self, collection_name: str, query: dict):
        """Find satu dokumen dari collection"""
        try:
            collection = self.db_connection.get_collection(collection_name)
            return collection.find_one(query)
        except Exception as e:
            print(f"Error finding document: {str(e)}")
            return None
    
    def update_document(self, collection_name: str, query: dict, update_data: dict):
        """Update dokumen di collection"""
        try:
            collection = self.db_connection.get_collection(collection_name)
            result = collection.update_one(query, {'$set': update_data})
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating document: {str(e)}")
            return False
    
    def delete_document(self, collection_name: str, query: dict):
        """Delete dokumen dari collection"""
        try:
            collection = self.db_connection.get_collection(collection_name)
            result = collection.delete_one(query)
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False
    
    def count_documents(self, collection_name: str, query: dict = None) -> int:
        """Count jumlah dokumen di collection"""
        try:
            collection = self.db_connection.get_collection(collection_name)
            return collection.count_documents(query or {})
        except Exception as e:
            print(f"Error counting documents: {str(e)}")
            return 0 