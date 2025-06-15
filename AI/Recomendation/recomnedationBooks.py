import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import openai
from pymongo import MongoClient
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Konfigurasi OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

class BookRecommender:
    def __init__(self):
        # Koneksi ke MongoDB
        self.client = MongoClient(os.getenv('MONGODB_URI'))
        self.db = self.client['smartlibrary']
        self.books_collection = self.db['books']
        self.reviews_collection = self.db['reviews']
        
        # Inisialisasi vectorizer untuk content-based filtering
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000
        )
        
        # Inisialisasi scaler untuk normalisasi
        self.scaler = MinMaxScaler()
        
        # Load data
        self.load_data()
        
    def load_data(self):
        """Load data dari MongoDB"""
        # Load buku
        self.books_df = pd.DataFrame(list(self.books_collection.find()))
        
        # Load ulasan
        self.reviews_df = pd.DataFrame(list(self.reviews_collection.find()))
        
        # Persiapkan data untuk content-based filtering
        self.books_df['content'] = self.books_df['title'] + ' ' + \
                                 self.books_df['description'] + ' ' + \
                                 self.books_df['author'] + ' ' + \
                                 self.books_df['genre']
        
        # Buat TF-IDF matrix
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.books_df['content'])
        
        # Buat user-item matrix untuk collaborative filtering
        self.user_item_matrix = self.reviews_df.pivot(
            index='user_id',
            columns='book_id',
            values='rating'
        ).fillna(0)
        
    def get_content_based_recommendations(self, book_id: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Mendapatkan rekomendasi berdasarkan konten buku"""
        # Dapatkan indeks buku
        book_idx = self.books_df[self.books_df['_id'] == book_id].index[0]
        
        # Hitung similarity scores
        cosine_similarities = cosine_similarity(
            self.tfidf_matrix[book_idx:book_idx+1],
            self.tfidf_matrix
        ).flatten()
        
        # Dapatkan indeks buku yang paling similar
        similar_indices = cosine_similarities.argsort()[-n_recommendations-1:-1][::-1]
        
        # Dapatkan detail buku yang direkomendasikan
        recommendations = []
        for idx in similar_indices:
            book = self.books_df.iloc[idx]
            recommendations.append({
                'book_id': str(book['_id']),
                'title': book['title'],
                'author': book['author'],
                'similarity_score': float(cosine_similarities[idx])
            })
            
        return recommendations
    
    def get_collaborative_recommendations(self, user_id: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Mendapatkan rekomendasi berdasarkan collaborative filtering"""
        if user_id not in self.user_item_matrix.index:
            return []
            
        # Hitung similarity antar user
        user_similarities = cosine_similarity(
            self.user_item_matrix.loc[user_id:user_id],
            self.user_item_matrix
        ).flatten()
        
        # Dapatkan user yang paling similar
        similar_users = user_similarities.argsort()[-n_recommendations-1:-1][::-1]
        
        # Dapatkan buku yang belum dibaca oleh user
        user_books = set(self.user_item_matrix.columns[self.user_item_matrix.loc[user_id] > 0])
        all_books = set(self.user_item_matrix.columns)
        unread_books = all_books - user_books
        
        # Hitung prediksi rating untuk buku yang belum dibaca
        predictions = []
        for book_id in unread_books:
            # Dapatkan rating dari user yang similar
            similar_user_ratings = self.user_item_matrix.iloc[similar_users][book_id]
            # Hitung weighted average rating
            weighted_rating = np.average(
                similar_user_ratings,
                weights=user_similarities[similar_users]
            )
            predictions.append((book_id, weighted_rating))
            
        # Urutkan berdasarkan prediksi rating
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        # Dapatkan detail buku yang direkomendasikan
        recommendations = []
        for book_id, predicted_rating in predictions[:n_recommendations]:
            book = self.books_df[self.books_df['_id'] == book_id].iloc[0]
            recommendations.append({
                'book_id': str(book['_id']),
                'title': book['title'],
                'author': book['author'],
                'predicted_rating': float(predicted_rating)
            })
            
        return recommendations
    
    def get_ai_enhanced_recommendations(self, user_preferences: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Mendapatkan rekomendasi yang ditingkatkan dengan OpenAI"""
        try:
            # Gunakan OpenAI untuk menganalisis preferensi user
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Anda adalah asisten yang ahli dalam menganalisis preferensi buku."},
                    {"role": "user", "content": f"Analisis preferensi buku berikut dan berikan 5 kata kunci yang relevan: {user_preferences}"}
                ]
            )
            
            # Ekstrak kata kunci dari respons OpenAI
            keywords = response.choices[0].message.content.strip().split('\n')
            
            # Tambahkan kata kunci ke query pencarian
            search_query = ' '.join(keywords)
            
            # Gunakan TF-IDF untuk mencari buku yang cocok
            query_vector = self.tfidf_vectorizer.transform([search_query])
            cosine_similarities = cosine_similarity(
                query_vector,
                self.tfidf_matrix
            ).flatten()
            
            # Dapatkan indeks buku yang paling cocok
            similar_indices = cosine_similarities.argsort()[-n_recommendations:][::-1]
            
            # Dapatkan detail buku yang direkomendasikan
            recommendations = []
            for idx in similar_indices:
                book = self.books_df.iloc[idx]
                recommendations.append({
                    'book_id': str(book['_id']),
                    'title': book['title'],
                    'author': book['author'],
                    'relevance_score': float(cosine_similarities[idx]),
                    'keywords': keywords
                })
                
            return recommendations
            
        except Exception as e:
            print(f"Error dalam AI-enhanced recommendations: {str(e)}")
            return []
    
    def get_hybrid_recommendations(self, user_id: str, book_id: str = None, user_preferences: str = None, n_recommendations: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """Mendapatkan rekomendasi hybrid dari semua metode"""
        recommendations = {
            'content_based': [],
            'collaborative': [],
            'ai_enhanced': []
        }
        
        # Content-based recommendations
        if book_id:
            recommendations['content_based'] = self.get_content_based_recommendations(
                book_id,
                n_recommendations
            )
        
        # Collaborative filtering recommendations
        if user_id:
            recommendations['collaborative'] = self.get_collaborative_recommendations(
                user_id,
                n_recommendations
            )
        
        # AI-enhanced recommendations
        if user_preferences:
            recommendations['ai_enhanced'] = self.get_ai_enhanced_recommendations(
                user_preferences,
                n_recommendations
            )
        
        return recommendations

# Contoh penggunaan
if __name__ == "__main__":
    recommender = BookRecommender()
    
    # Contoh mendapatkan rekomendasi hybrid
    recommendations = recommender.get_hybrid_recommendations(
        user_id="user123",
        book_id="book456",
        user_preferences="Saya suka novel fiksi ilmiah dengan tema perjalanan waktu dan teknologi futuristik",
        n_recommendations=5
    )
    
    print("Rekomendasi Hybrid:")
    for method, recs in recommendations.items():
        print(f"\n{method.upper()} Recommendations:")
        for rec in recs:
            print(f"- {rec['title']} by {rec['author']}")
