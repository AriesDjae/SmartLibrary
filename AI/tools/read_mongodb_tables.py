#!/usr/bin/env python3
"""
Script untuk membaca tabel MongoDB dan atributnya
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import json

# Load environment variables
load_dotenv()

def connect_mongodb():
    """Koneksi ke MongoDB"""
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    database_name = os.getenv('DATABASE_NAME', 'inspira')
    
    try:
        client = MongoClient(mongodb_uri)
        db = client[database_name]
        print(f"✅ Terhubung ke database: {database_name}")
        return client, db
    except Exception as e:
        print(f"❌ Error koneksi: {str(e)}")
        return None, None

def get_collections_info(db):
    """Mendapatkan informasi semua collections"""
    collections = db.list_collection_names()
    print(f"\n📚 Collections yang tersedia: {len(collections)}")
    
    for i, collection_name in enumerate(collections, 1):
        count = db[collection_name].count_documents({})
        print(f"   {i}. {collection_name} ({count} dokumen)")
    
    return collections

def analyze_collection_structure(db, collection_name):
    """Menganalisis struktur collection"""
    print(f"\n🔍 Analisis Collection: {collection_name}")
    print("=" * 50)
    
    collection = db[collection_name]
    count = collection.count_documents({})
    print(f"Total dokumen: {count}")
    
    if count == 0:
        print("Collection kosong!")
        return
    
    # Ambil sample dokumen untuk analisis struktur
    sample_docs = list(collection.find().limit(3))
    
    print(f"\n📋 Struktur atribut (berdasarkan {len(sample_docs)} sample dokumen):")
    
    # Analisis atribut dari sample dokumen
    all_fields = set()
    for doc in sample_docs:
        all_fields.update(doc.keys())
    
    for field in sorted(all_fields):
        # Hitung berapa dokumen yang memiliki field ini
        field_count = collection.count_documents({field: {'$exists': True}})
        percentage = (field_count / count) * 100 if count > 0 else 0
        
        # Tentukan tipe data yang umum
        field_types = {}
        for doc in sample_docs:
            if field in doc:
                field_type = type(doc[field]).__name__
                field_types[field_type] = field_types.get(field_type, 0) + 1
        
        most_common_type = max(field_types.items(), key=lambda x: x[1])[0] if field_types else "unknown"
        
        print(f"   • {field}:")
        print(f"     - Tipe: {most_common_type}")
        print(f"     - Ada di: {field_count}/{count} dokumen ({percentage:.1f}%)")
        
        # Tampilkan sample value
        for doc in sample_docs:
            if field in doc:
                sample_value = doc[field]
                if isinstance(sample_value, str) and len(sample_value) > 50:
                    sample_value = sample_value[:50] + "..."
                elif isinstance(sample_value, ObjectId):
                    sample_value = str(sample_value)
                print(f"     - Sample: {sample_value}")
                break

def show_collection_data(db, collection_name, limit=5):
    """Menampilkan data collection"""
    print(f"\n📄 Data Collection: {collection_name} (limit {limit})")
    print("=" * 50)
    
    collection = db[collection_name]
    documents = list(collection.find().limit(limit))
    
    if not documents:
        print("Tidak ada data!")
        return
    
    for i, doc in enumerate(documents, 1):
        print(f"\nDokumen {i}:")
        # Convert ObjectId to string untuk display
        display_doc = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                display_doc[key] = str(value)
            elif isinstance(value, str) and len(value) > 100:
                display_doc[key] = value[:100] + "..."
            else:
                display_doc[key] = value
        
        print(json.dumps(display_doc, indent=2, ensure_ascii=False))

def main():
    """Main function"""
    print("=== MongoDB Table Reader ===\n")
    
    # Koneksi ke MongoDB
    client, db = connect_mongodb()
    if db is None:
        return
    
    try:
        # Dapatkan info collections
        collections = get_collections_info(db)
        
        if not collections:
            print("Tidak ada collections yang ditemukan!")
            return
        
        # Analisis setiap collection
        for collection_name in collections:
            analyze_collection_structure(db, collection_name)
            show_collection_data(db, collection_name, limit=2)
            print("\n" + "="*60 + "\n")
        
        print("✅ Analisis selesai!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    finally:
        if client:
            client.close()
            print("🔌 Koneksi database ditutup")

if __name__ == '__main__':
    main() 