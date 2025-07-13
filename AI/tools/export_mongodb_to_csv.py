#!/usr/bin/env python3
"""
Script untuk mengekspor semua data dari MongoDB ke file CSV (satu file per collection)
"""

import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'test')
EXPORT_DIR = 'exports_csv'


def export_collection_to_csv(db, collection_name, export_dir):
    """Ekspor satu collection ke file CSV"""
    collection = db[collection_name]
    data = list(collection.find())
    if not data:
        print(f"Collection '{collection_name}' kosong, tidak diekspor.")
        return
    # Convert ObjectId to string
    for doc in data:
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])
    df = pd.DataFrame(data)
    os.makedirs(export_dir, exist_ok=True)
    csv_path = os.path.join(export_dir, f"{collection_name}.csv")
    df.to_csv(csv_path, index=False, encoding='utf-8')
    print(f"Berhasil ekspor {len(df)} data dari collection '{collection_name}' ke {csv_path}")


def main():
    print("=== EKSPOR SEMUA DATA MONGODB KE CSV ===\n")
    print(f"Koneksi ke MongoDB: {MONGODB_URI}")
    print(f"Database: {DATABASE_NAME}")
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        collections = db.list_collection_names()
        if not collections:
            print("Tidak ada collection yang ditemukan di database.")
            return
        print(f"Ditemukan {len(collections)} collection: {', '.join(collections)}\n")
        for collection_name in collections:
            export_collection_to_csv(db, collection_name, EXPORT_DIR)
        print(f"\nSemua data berhasil diekspor ke folder '{EXPORT_DIR}'.")
    except Exception as e:
        print(f"Gagal mengekspor data: {str(e)}")

if __name__ == '__main__':
    main() 