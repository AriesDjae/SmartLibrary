#!/usr/bin/env python3
"""
Interactive Database Reader untuk SmartLibrary
Script interaktif untuk membaca dan mengeksplorasi data MongoDB
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import json
from datetime import datetime

# Load environment variables
load_dotenv()

class InteractiveDBReader:
    """Class untuk membaca database secara interaktif"""
    
    def __init__(self):
        """Inisialisasi reader"""
        self.client = None
        self.db = None
        self.current_collection = None
        
    def connect_mongodb(self):
        """Koneksi ke MongoDB"""
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
        database_name = os.getenv('DATABASE_NAME', 'smartlibrary')
        
        # Mask URI untuk keamanan
        masked_uri = self._mask_connection_string(mongodb_uri)
        print(f"🔗 Mencoba koneksi ke: {masked_uri}")
        print(f"📁 Database: {database_name}")
        
        try:
            self.client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            # Test koneksi
            self.client.admin.command('ping')
            self.db = self.client[database_name]
            print(f"✅ Terhubung ke database: {database_name}")
            return True
        except Exception as e:
            print(f"❌ Error koneksi: {str(e)}")
            print("💡 Pastikan MongoDB berjalan atau URI sudah benar")
            return False
    
    def _mask_connection_string(self, uri):
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
    
    def _sanitize_filename(self, filename):
        """Sanitasi nama file untuk keamanan"""
        import re
        # Hapus karakter berbahaya
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        # Hapus path traversal
        filename = filename.replace('..', '').replace('./', '').replace('/', '').replace('\\', '')
        # Batasi panjang
        if len(filename) > 50:
            filename = filename[:50]
        # Pastikan tidak kosong
        if not filename.strip():
            filename = "export"
        return filename.strip()
    
    def _is_safe_path(self, filename):
        """Validasi path untuk mencegah directory traversal"""
        dangerous_patterns = [
            '..', '../', '..\\', './', '.\\', '/', '\\',
            'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 'N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'
        ]
        
        filename_lower = filename.lower()
        for pattern in dangerous_patterns:
            if pattern in filename_lower:
                return False
        
        # Pastikan file hanya di direktori saat ini
        import os
        current_dir = os.getcwd()
        file_path = os.path.join(current_dir, filename)
        
        # Validasi bahwa file path tidak keluar dari direktori saat ini
        try:
            file_path = os.path.abspath(file_path)
            current_dir = os.path.abspath(current_dir)
            return file_path.startswith(current_dir)
        except:
            return False
    
    def show_main_menu(self):
        """Tampilkan menu utama"""
        print("\n" + "="*60)
        print("🗄️  INTERACTIVE MONGODB READER")
        print("="*60)
        print("1. 📊 Lihat Overview Database")
        print("2. 📚 Pilih Collection")
        print("3. 🔍 Cari Data")
        print("4. 📈 Statistik Collection")
        print("5. 📄 Lihat Data Collection")
        print("6. 🔧 Export Data")
        print("0. 🚪 Keluar")
        print("="*60)
        if self.current_collection:
            print(f"📍 Collection aktif: {self.current_collection}")
        print("="*60)
    
    def show_breadcrumb(self, current_page):
        """Tampilkan breadcrumb navigasi"""
        breadcrumb = f"🏠 Menu Utama > {current_page}"
        if self.current_collection:
            breadcrumb += f" > 📚 {self.current_collection}"
        print(f"\n📍 {breadcrumb}")
        print("-" * len(breadcrumb) + "-" * 10)
    
    def show_database_overview(self):
        """Tampilkan overview database"""
        while True:
            self.show_breadcrumb("📊 Database Overview")
            print("\n📊 DATABASE OVERVIEW")
            print("-" * 40)
            
            collections = self.db.list_collection_names()
            print(f"Database: {self.db.name}")
            print(f"Total Collections: {len(collections)}")
            
            if collections:
                print("\nCollections:")
                for i, collection_name in enumerate(collections, 1):
                    count = self.db[collection_name].count_documents({})
                    print(f"  {i}. {collection_name} ({count} dokumen)")
            else:
                print("  Tidak ada collections")
            
            print("\n" + "-" * 40)
            print("0. ⬅️  Kembali ke Menu Utama")
            
            choice = input("\nPilihan: ")
            if choice == "0":
                break
            else:
                print("❌ Pilihan tidak valid!")
                input("\nTekan Enter untuk melanjutkan...")
    
    def select_collection(self):
        """Pilih collection untuk dieksplorasi"""
        while True:
            self.show_breadcrumb("📚 Pilih Collection")
            collections = self.db.list_collection_names()
            
            if not collections:
                print("❌ Tidak ada collections yang tersedia")
                input("\nTekan Enter untuk kembali...")
                break
            
            print("\n📚 PILIH COLLECTION")
            print("-" * 40)
            
            for i, collection_name in enumerate(collections, 1):
                count = self.db[collection_name].count_documents({})
                print(f"{i}. {collection_name} ({count} dokumen)")
            
            print("\n" + "-" * 40)
            print("0. ⬅️  Kembali ke Menu Utama")
            
            try:
                choice = input(f"\nPilih collection (0-{len(collections)}): ")
                if choice == "0":
                    break
                
                choice_num = int(choice)
                if 1 <= choice_num <= len(collections):
                    self.current_collection = collections[choice_num - 1]
                    print(f"✅ Collection dipilih: {self.current_collection}")
                    input("\nTekan Enter untuk melanjutkan...")
                    break
                else:
                    print("❌ Pilihan tidak valid")
                    input("\nTekan Enter untuk melanjutkan...")
            except ValueError:
                print("❌ Masukkan angka yang valid")
                input("\nTekan Enter untuk melanjutkan...")
    
    def search_data(self):
        """Cari data dalam collection"""
        if not self.current_collection:
            print("❌ Pilih collection terlebih dahulu!")
            input("\nTekan Enter untuk kembali...")
            return
        
        while True:
            self.show_breadcrumb("🔍 Cari Data")
            print(f"\n🔍 CARI DATA - Collection: {self.current_collection}")
            print("-" * 50)
            
            collection = self.db[self.current_collection]
            
            # Tampilkan field yang tersedia
            sample_doc = collection.find_one()
            if not sample_doc:
                print("❌ Collection kosong")
                input("\nTekan Enter untuk kembali...")
                break
            
            print("Field yang tersedia:")
            for i, field in enumerate(sample_doc.keys(), 1):
                print(f"  {i}. {field}")
            
            print("\n" + "-" * 50)
            print("0. ⬅️  Kembali ke Menu Utama")
            
            try:
                field_choice = input(f"\nPilih field untuk dicari (0-{len(sample_doc.keys())}): ")
                if field_choice == "0":
                    break
                
                field_num = int(field_choice)
                if 1 <= field_num <= len(sample_doc.keys()):
                    field_name = list(sample_doc.keys())[field_num - 1]
                    
                    search_term = input(f"Masukkan kata kunci untuk field '{field_name}': ")
                    if search_term.lower() == 'back':
                        continue
                    
                    # Lakukan pencarian
                    query = {field_name: {'$regex': search_term, '$options': 'i'}}
                    results = list(collection.find(query).limit(10))
                    
                    print(f"\n📄 Hasil Pencarian ({len(results)} dokumen):")
                    print("-" * 40)
                    
                    for i, doc in enumerate(results, 1):
                        print(f"\nDokumen {i}:")
                        self._display_document(doc, max_length=100)
                    
                    input("\nTekan Enter untuk melanjutkan...")
                else:
                    print("❌ Pilihan tidak valid")
                    input("\nTekan Enter untuk melanjutkan...")
            except (ValueError, IndexError):
                print("❌ Pilihan tidak valid")
                input("\nTekan Enter untuk melanjutkan...")
            except Exception as e:
                print(f"❌ Error: {str(e)}")
                input("\nTekan Enter untuk melanjutkan...")
    
    def show_collection_stats(self):
        """Tampilkan statistik collection"""
        if not self.current_collection:
            print("❌ Pilih collection terlebih dahulu!")
            input("\nTekan Enter untuk kembali...")
            return
        
        while True:
            self.show_breadcrumb("📈 Statistik Collection")
            print(f"\n📈 STATISTIK - Collection: {self.current_collection}")
            print("-" * 50)
            
            collection = self.db[self.current_collection]
            total_docs = collection.count_documents({})
            
            print(f"Total dokumen: {total_docs}")
            
            if total_docs > 0:
                # Analisis field
                sample_docs = list(collection.find().limit(5))
                all_fields = set()
                for doc in sample_docs:
                    all_fields.update(doc.keys())
                
                print(f"\nField yang tersedia ({len(all_fields)}):")
                for field in sorted(all_fields):
                    field_count = collection.count_documents({field: {'$exists': True}})
                    percentage = (field_count / total_docs) * 100
                    print(f"  • {field}: {field_count}/{total_docs} ({percentage:.1f}%)")
                
                # Jika ada field rating, tampilkan statistik rating
                if 'rating' in all_fields:
                    pipeline = [
                        {'$group': {'_id': None, 'avg_rating': {'$avg': '$rating'}, 'min_rating': {'$min': '$rating'}, 'max_rating': {'$max': '$rating'}}}
                    ]
                    rating_stats = list(collection.aggregate(pipeline))
                    if rating_stats:
                        stats = rating_stats[0]
                        print(f"\n📊 Statistik Rating:")
                        print(f"  • Rata-rata: {stats['avg_rating']:.2f}")
                        print(f"  • Minimum: {stats['min_rating']}")
                        print(f"  • Maximum: {stats['max_rating']}")
            
            print("\n" + "-" * 50)
            print("0. ⬅️  Kembali ke Menu Utama")
            
            choice = input("\nPilihan: ")
            if choice == "0":
                break
            else:
                print("❌ Pilihan tidak valid!")
                input("\nTekan Enter untuk melanjutkan...")
    
    def view_collection_data(self):
        """Lihat data collection"""
        if not self.current_collection:
            print("❌ Pilih collection terlebih dahulu!")
            input("\nTekan Enter untuk kembali...")
            return
        
        while True:
            self.show_breadcrumb("📄 Lihat Data Collection")
            print(f"\n📄 DATA COLLECTION - {self.current_collection}")
            print("-" * 50)
            
            collection = self.db[self.current_collection]
            
            try:
                limit_input = input("Jumlah dokumen yang ditampilkan (default 5): ")
                if limit_input.lower() == 'back':
                    break
                elif limit_input.lower() == 'exit':
                    return
                
                limit = int(limit_input or "5")
                if limit <= 0:
                    print("⚠️  Limit harus lebih dari 0, menggunakan default 5")
                    limit = 5
                elif limit > 100:
                    print("⚠️  Limit terlalu besar, menggunakan maksimal 100")
                    limit = 100
            except ValueError:
                print("⚠️  Input tidak valid, menggunakan default 5")
                limit = 5
            
            documents = list(collection.find().limit(limit))
            
            if not documents:
                print("❌ Tidak ada data")
                input("\nTekan Enter untuk melanjutkan...")
                continue
            
            print(f"\nMenampilkan {len(documents)} dokumen:")
            
            for i, doc in enumerate(documents, 1):
                print(f"\n{'='*60}")
                print(f"DOKUMEN {i}")
                print('='*60)
                self._display_document(doc)
            
            # Menu untuk navigasi
            while True:
                print(f"\n📄 Navigasi Data - {self.current_collection}")
                print("1. Lihat dokumen berikutnya")
                print("2. Lihat dokumen sebelumnya")
                print("3. Lihat dokumen spesifik")
                print("4. Lihat data lagi")
                print("0. ⬅️  Kembali ke Menu Utama")
                
                choice = input("\nPilihan: ")
                
                if choice == "0":
                    return
                elif choice == "1":
                    # Implementasi untuk next page
                    print("🔄 Fitur ini akan diimplementasikan")
                    input("\nTekan Enter untuk melanjutkan...")
                elif choice == "2":
                    # Implementasi untuk previous page
                    print("🔄 Fitur ini akan diimplementasikan")
                    input("\nTekan Enter untuk melanjutkan...")
                elif choice == "3":
                    try:
                        doc_id = input("Masukkan ID dokumen: ")
                        if doc_id.lower() == 'back':
                            continue
                        elif not doc_id.strip():
                            print("❌ ID tidak boleh kosong")
                            input("\nTekan Enter untuk melanjutkan...")
                            continue
                        
                        specific_doc = collection.find_one({'_id': ObjectId(doc_id)})
                        if specific_doc:
                            self._display_document(specific_doc)
                        else:
                            print("❌ Dokumen tidak ditemukan")
                        input("\nTekan Enter untuk melanjutkan...")
                    except Exception as e:
                        print(f"❌ Error: {str(e)}")
                        input("\nTekan Enter untuk melanjutkan...")
                elif choice == "4":
                    break  # Kembali ke input limit
                else:
                    print("❌ Pilihan tidak valid!")
                    input("\nTekan Enter untuk melanjutkan...")
    
    def export_data(self):
        """Export data collection"""
        if not self.current_collection:
            print("❌ Pilih collection terlebih dahulu!")
            input("\nTekan Enter untuk kembali...")
            return
        
        while True:
            self.show_breadcrumb("📤 Export Data")
            print(f"\n📤 EXPORT DATA - Collection: {self.current_collection}")
            print("-" * 50)
            
            collection = self.db[self.current_collection]
            
            try:
                filename_input = input("Nama file (tanpa ekstensi): ")
                if filename_input.lower() == 'back':
                    break
                
                # Validasi nama file untuk keamanan
                safe_filename = self._sanitize_filename(filename_input or f"{self.current_collection}_export")
                filename = f"{safe_filename}.json"
                
                # Validasi path untuk mencegah directory traversal
                if not self._is_safe_path(filename):
                    print("❌ Nama file tidak aman!")
                    input("\nTekan Enter untuk melanjutkan...")
                    continue
                
                # Ambil semua data
                documents = list(collection.find())
                
                # Convert ObjectId to string
                for doc in documents:
                    if '_id' in doc:
                        doc['_id'] = str(doc['_id'])
                
                # Export ke file
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(documents, f, indent=2, ensure_ascii=False, default=str)
                
                print(f"✅ Data berhasil diexport ke: {filename}")
                print(f"   Total dokumen: {len(documents)}")
                
                print("\n" + "-" * 50)
                print("0. ⬅️  Kembali ke Menu Utama")
                print("1. Export collection lain")
                
                choice = input("\nPilihan: ")
                if choice == "0":
                    break
                elif choice == "1":
                    continue
                else:
                    print("❌ Pilihan tidak valid!")
                    input("\nTekan Enter untuk melanjutkan...")
                    
            except Exception as e:
                print(f"❌ Error export: {str(e)}")
                input("\nTekan Enter untuk melanjutkan...")
    
    def _display_document(self, doc, max_length=200):
        """Tampilkan dokumen dengan format yang rapi"""
        display_doc = {}
        
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                display_doc[key] = str(value)
            elif isinstance(value, datetime):
                display_doc[key] = value.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(value, str) and len(value) > max_length:
                display_doc[key] = value[:max_length] + "..."
            else:
                display_doc[key] = value
        
        print(json.dumps(display_doc, indent=2, ensure_ascii=False))
    
    def run(self):
        """Jalankan aplikasi interaktif"""
        print("🗄️  INTERACTIVE MONGODB READER")
        print("Memulai aplikasi...")
        
        if not self.connect_mongodb():
            return
        
        while True:
            self.show_main_menu()
            choice = input("\nPilih menu (0-6): ")
            
            if choice == "0":
                print("👋 Terima kasih telah menggunakan Interactive DB Reader!")
                break
            elif choice == "1":
                self.show_database_overview()
            elif choice == "2":
                self.select_collection()
            elif choice == "3":
                if not self.current_collection:
                    print("❌ Pilih collection terlebih dahulu di menu 2!")
                    input("\nTekan Enter untuk melanjutkan...")
                else:
                    self.search_data()
            elif choice == "4":
                if not self.current_collection:
                    print("❌ Pilih collection terlebih dahulu di menu 2!")
                    input("\nTekan Enter untuk melanjutkan...")
                else:
                    self.show_collection_stats()
            elif choice == "5":
                if not self.current_collection:
                    print("❌ Pilih collection terlebih dahulu di menu 2!")
                    input("\nTekan Enter untuk melanjutkan...")
                else:
                    self.view_collection_data()
            elif choice == "6":
                if not self.current_collection:
                    print("❌ Pilih collection terlebih dahulu di menu 2!")
                    input("\nTekan Enter untuk melanjutkan...")
                else:
                    self.export_data()
            else:
                print("❌ Pilihan tidak valid!")
                input("\nTekan Enter untuk melanjutkan...")
        
        if self.client:
            self.client.close()
            print("🔌 Koneksi database ditutup")

def main():
    """Main function"""
    reader = InteractiveDBReader()
    reader.run()

if __name__ == '__main__':
    main() 