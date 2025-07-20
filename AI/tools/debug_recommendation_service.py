#!/usr/bin/env python3
"""
Script untuk debugging RecommendationService
"""

import os
import sys
from dotenv import load_dotenv
import pandas as pd

# Load environment variables
load_dotenv()

# Tambahkan direktori AI ke path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.recommendation_service import RecommendationService
from pymongo import MongoClient

def debug_recommendation_service():
    """Debug RecommendationService untuk melihat masalah data loading"""
    
    print("🔍 DEBUGGING RECOMMENDATION SERVICE")
    print("=" * 50)
    
    try:
        # Setup database connection
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            print("❌ MONGODB_URI tidak ditemukan")
            return
        
        client = MongoClient(mongodb_uri)
        db = client['smartlibrary']
        
        print("📊 CHECKING DATABASE COLLECTIONS")
        print("-" * 30)
        
        # Check books collection
        books_count = db.books.count_documents({})
        print(f"📚 Books collection: {books_count} documents")
        
        if books_count > 0:
            sample_book = db.books.find_one()
            print(f"   Sample book ID: {sample_book.get('_id')}")
            print(f"   Sample book title: {sample_book.get('title')}")
        
        # Check ratings collection
        ratings_count = db.ratings.count_documents({})
        print(f"⭐ Ratings collection: {ratings_count} documents")
        
        if ratings_count > 0:
            sample_rating = db.ratings.find_one()
            print(f"   Sample rating user_id: {sample_rating.get('user_id')}")
            print(f"   Sample rating book_id: {sample_rating.get('book_id')}")
            print(f"   Sample rating value: {sample_rating.get('rating_value')}")
        
        # Check borrowings collection
        borrowings_count = db.borrowings.count_documents({})
        print(f"📖 Borrowings collection: {borrowings_count} documents")
        
        if borrowings_count > 0:
            sample_borrowing = db.borrowings.find_one()
            print(f"   Sample borrowing user_id: {sample_borrowing.get('user_id')}")
            print(f"   Sample borrowing book_id: {sample_borrowing.get('books_id')}")
        
        # Check user_interactions collection
        interactions_count = db.user_interactions.count_documents({})
        print(f"👤 User interactions collection: {interactions_count} documents")
        
        if interactions_count > 0:
            sample_interaction = db.user_interactions.find_one()
            print(f"   Sample interaction user_id: {sample_interaction.get('user_id')}")
            print(f"   Sample interaction book_id: {sample_interaction.get('book_id')}")
            print(f"   Sample interaction type: {sample_interaction.get('type')}")
        
        print("\n🔧 TESTING RECOMMENDATION SERVICE")
        print("-" * 30)
        
        # Initialize RecommendationService
        recommendation_service = RecommendationService()
        
        print(f"📊 Books DataFrame shape: {recommendation_service.books_df.shape}")
        print(f"📊 Ratings DataFrame shape: {recommendation_service.ratings_df.shape}")
        print(f"📊 User-Item Matrix shape: {recommendation_service.user_item_matrix.shape}")
        print(f"📊 TF-IDF Matrix shape: {recommendation_service.tfidf_matrix.shape if recommendation_service.tfidf_matrix is not None else 'None'}")
        
        # Test content-based recommendations
        print("\n🎯 TESTING CONTENT-BASED RECOMMENDATIONS")
        print("-" * 30)
        
        if not recommendation_service.books_df.empty:
            # Get a sample book ID
            sample_book_id = str(recommendation_service.books_df.iloc[0]['_id'])
            print(f"Testing with book ID: {sample_book_id}")
            
            content_recs = recommendation_service.get_content_based_recommendations(
                sample_book_id, 3
            )
            print(f"Content-based recommendations: {len(content_recs)}")
            for i, rec in enumerate(content_recs, 1):
                print(f"   {i}. {rec.get('title', 'N/A')} - {rec.get('author', 'N/A')}")
        else:
            print("❌ No books data available")
        
        # Test collaborative recommendations
        print("\n👥 TESTING COLLABORATIVE RECOMMENDATIONS")
        print("-" * 30)
        
        if not recommendation_service.user_item_matrix.empty:
            # Get a sample user ID
            sample_user_id = recommendation_service.user_item_matrix.index[0]
            print(f"Testing with user ID: {sample_user_id}")
            
            collab_recs = recommendation_service.get_collaborative_recommendations(
                sample_user_id, 3
            )
            print(f"Collaborative recommendations: {len(collab_recs)}")
            for i, rec in enumerate(collab_recs, 1):
                print(f"   {i}. {rec.get('title', 'N/A')} - {rec.get('author', 'N/A')}")
        else:
            print("❌ No user-item matrix available")
        
        # Test AI-enhanced recommendations
        print("\n🤖 TESTING AI-ENHANCED RECOMMENDATIONS")
        print("-" * 30)
        
        ai_recs = recommendation_service.get_ai_enhanced_recommendations(
            "Saya suka membaca buku fiksi ilmiah", 3
        )
        print(f"AI-enhanced recommendations: {len(ai_recs)}")
        for i, rec in enumerate(ai_recs, 1):
            print(f"   {i}. {rec.get('title', 'N/A')} - {rec.get('author', 'N/A')}")
        
        # Test hybrid recommendations
        print("\n🎯 TESTING HYBRID RECOMMENDATIONS")
        print("-" * 30)
        
        if not recommendation_service.books_df.empty:
            sample_book_id = str(recommendation_service.books_df.iloc[0]['_id'])
            sample_user_id = recommendation_service.user_item_matrix.index[0] if not recommendation_service.user_item_matrix.empty else None
            
            hybrid_recs = recommendation_service.get_hybrid_recommendations(
                user_id=sample_user_id,
                book_id=sample_book_id,
                user_preferences="Saya suka membaca buku fiksi ilmiah",
                n_recommendations=3
            )
            
            print(f"Hybrid recommendations:")
            print(f"   Content-based: {len(hybrid_recs['content_based'])}")
            print(f"   Collaborative: {len(hybrid_recs['collaborative'])}")
            print(f"   AI-enhanced: {len(hybrid_recs['ai_enhanced'])}")
        
        print("\n✅ DEBUGGING COMPLETED")
        
    except Exception as e:
        print(f"❌ Error during debugging: {str(e)}")
        import traceback
        traceback.print_exc()

def create_sample_data():
    """Membuat sample data untuk testing jika tidak ada data"""
    
    print("🔧 CREATING SAMPLE DATA")
    print("=" * 30)
    
    try:
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            print("❌ MONGODB_URI tidak ditemukan")
            return
        
        client = MongoClient(mongodb_uri)
        db = client['smartlibrary']
        
        # Check if we need to create sample data
        books_count = db.books.count_documents({})
        ratings_count = db.ratings.count_documents({})
        
        if books_count == 0:
            print("📚 Creating sample books...")
            sample_books = [
                {
                    "_id": "book1",
                    "title": "Dune",
                    "author": "Frank Herbert",
                    "genre": "Fiksi Ilmiah",
                    "description": "Novel fiksi ilmiah tentang planet Arrakis"
                },
                {
                    "_id": "book2", 
                    "title": "The Martian",
                    "author": "Andy Weir",
                    "genre": "Fiksi Ilmiah",
                    "description": "Kisah astronot yang terdampar di Mars"
                },
                {
                    "_id": "book3",
                    "title": "Ready Player One",
                    "author": "Ernest Cline", 
                    "genre": "Fiksi Ilmiah",
                    "description": "Petualangan di dunia virtual reality"
                },
                {
                    "_id": "book4",
                    "title": "1984",
                    "author": "George Orwell",
                    "genre": "Distopia",
                    "description": "Novel distopia tentang totalitarianisme"
                },
                {
                    "_id": "book5",
                    "title": "The Hobbit",
                    "author": "J.R.R. Tolkien",
                    "genre": "Fantasi",
                    "description": "Petualangan Bilbo Baggins di Middle-earth"
                }
            ]
            db.books.insert_many(sample_books)
            print(f"✅ Created {len(sample_books)} sample books")
        
        if ratings_count == 0:
            print("⭐ Creating sample ratings...")
            sample_ratings = [
                {"user_id": "user1", "book_id": "book1", "rating_value": 5},
                {"user_id": "user1", "book_id": "book2", "rating_value": 4},
                {"user_id": "user1", "book_id": "book3", "rating_value": 5},
                {"user_id": "user2", "book_id": "book1", "rating_value": 4},
                {"user_id": "user2", "book_id": "book2", "rating_value": 5},
                {"user_id": "user2", "book_id": "book4", "rating_value": 3},
                {"user_id": "user3", "book_id": "book1", "rating_value": 5},
                {"user_id": "user3", "book_id": "book3", "rating_value": 4},
                {"user_id": "user3", "book_id": "book5", "rating_value": 5},
                {"user_id": "user4", "book_id": "book2", "rating_value": 4},
                {"user_id": "user4", "book_id": "book4", "rating_value": 5},
                {"user_id": "user4", "book_id": "book5", "rating_value": 4}
            ]
            db.ratings.insert_many(sample_ratings)
            print(f"✅ Created {len(sample_ratings)} sample ratings")
        
        print("✅ Sample data creation completed")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {str(e)}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Debug RecommendationService")
    parser.add_argument("--create-sample", action="store_true", help="Create sample data if none exists")
    
    args = parser.parse_args()
    
    if args.create_sample:
        create_sample_data()
    
    debug_recommendation_service() 