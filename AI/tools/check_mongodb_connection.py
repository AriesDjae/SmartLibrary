#!/usr/bin/env python3
"""
Script untuk mengecek koneksi MongoDB dan membaca tabel
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Load environment variables
load_dotenv()

def mask_connection_string(uri):
    """Mask connection string untuk keamanan"""
    if not uri or 'mongodb://' not in uri:
        return uri
    
    try:
        # Parse URI
        if 'mongodb+srv://' in uri:
            # MongoDB Atlas
            parts = uri.split('@')
            if len(parts) >= 2:
                credentials = parts[0].replace('mongodb+srv://', '')
                if ':' in credentials:
                    username = credentials.split(':')[0]
                    return f"mongodb+srv://{username}:***@{parts[1]}"
        elif 'mongodb://' in uri:
            # Local MongoDB
            parts = uri.split('@')
            if len(parts) >= 2:
                credentials = parts[0].replace('mongodb://', '')
                if ':' in credentials:
                    username = credentials.split(':')[0]
                    return f"mongodb://{username}:***@{parts[1]}"
        
        return uri
    except:
        return "mongodb://***:***@***"

def check_mongodb_connection():
    """Cek koneksi MongoDB"""
    print("=== MongoDB Connection Checker ===\n")
    
    # Ambil konfigurasi dari environment
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    database_name = os.getenv('DATABASE_NAME')
    
    # Mask URI untuk keamanan
    masked_uri = mask_connection_string(mongodb_uri)
    print(f"🔗 URI: {masked_uri}")
    print(f"📁 Database: {database_name}")
    print()
    
    try:
        # Coba koneksi dengan timeout pendek
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        
        # Test koneksi
        client.admin.command('ping')
        print("✅ Koneksi MongoDB berhasil!")
        
        # Dapatkan database
        db = client[database_name]
        
        # Cek collections
        collections = db.list_collection_names()
        print(f"\n📚 Collections di database '{database_name}': {len(collections)}")
        
        if collections:
            for i, collection_name in enumerate(collections, 1):
                count = db[collection_name].count_documents({})
                print(f"   {i}. {collection_name} ({count} dokumen)")
                
                # Tampilkan struktur jika ada data
                if count > 0:
                    sample_doc = db[collection_name].find_one()
                    print("      Atribut:")
                    for field, value in sample_doc.items():
                        field_type = type(value).__name__
                        print(f"        • {field} ({field_type})")
        else:
            print("   Tidak ada collections yang ditemukan.")
            print("\n💡 Tips: Jalankan setup_sample_data.py untuk membuat data sample")
        
        client.close()
        return True
        
    except ServerSelectionTimeoutError:
        print("❌ MongoDB tidak dapat diakses!")
        print("\n🔧 Solusi:")
        print("1. Pastikan MongoDB berjalan:")
        print("   - Windows: Start MongoDB service")
        print("   - Linux/Mac: sudo systemctl start mongod")
        print("   - Atau gunakan MongoDB Atlas")
        print()
        print("2. Atau update MONGODB_URI di file .env:")
        print("   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/")
        return False
        
    except ConnectionFailure as e:
        print(f"❌ Error koneksi: {str(e)}")
        return False
        
    except Exception as e:
        print(f"❌ Error tidak diketahui: {str(e)}")
        return False

def show_setup_instructions():
    """Tampilkan instruksi setup"""
    print("\n" + "="*60)
    print("📋 INSTRUKSI SETUP MONGODB")
    print("="*60)
    
    print("\n1. 🚀 Opsi 1: MongoDB Local")
    print("   - Install MongoDB Community Server")
    print("   - Start service: sudo systemctl start mongod (Linux)")
    print("   - Atau start dari MongoDB Compass")
    
    print("\n2. ☁️  Opsi 2: MongoDB Atlas (Direkomendasikan)")
    print("   - Buat akun di mongodb.com/atlas")
    print("   - Buat cluster gratis")
    print("   - Dapatkan connection string")
    print("   - Update MONGODB_URI di file .env")
    
    print("\n3. 📝 Update file .env:")
    print("   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/")
    print("   DATABASE_NAME=smartlibrary")
    
    print("\n4. 🎯 Setup data sample:")
    print("   python setup_sample_data.py")
    
    print("\n5. ✅ Test koneksi:")
    print("   python check_mongodb_connection.py")

def main():
    """Main function"""
    success = check_mongodb_connection()
    
    if not success:
        show_setup_instructions()

if __name__ == '__main__':
    main() 