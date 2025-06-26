import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import openai
from pymongo import MongoClient
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RecommendationService:
    """Service class untuk menangani rekomendasi buku"""
    
    def __init__(self):
        """Inisialisasi Recommendation Service"""
        self._setup_openai()
        self._setup_database()
        self._setup_ml_components()
        self._load_data()
    
    def _setup_openai(self):
        """Setup konfigurasi OpenAI"""
        openai.api_key = os.getenv('OPENAI_API_KEY')
        if not openai.api_key:
            print("Warning: OPENAI_API_KEY tidak ditemukan")
    
    def _setup_database(self):
        """Setup koneksi database"""
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            raise ValueError("MONGODB_URI tidak ditemukan di environment variables")
        
        self.client = MongoClient(mongodb_uri)
        self.db = self.client['smartlibrary']
        self.books_collection = self.db['books']
        self.reviews_collection = self.db['reviews']
    
    def _setup_ml_components(self):
        """Setup komponen machine learning"""
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2)
        )
        self.scaler = MinMaxScaler()
    
    def _load_data(self):
        """Load data dari MongoDB"""
        try:
            # Load buku
            books_data = list(self.books_collection.find())
            self.books_df = pd.DataFrame(books_data)
            
            # Load ulasan
            reviews_data = list(self.reviews_collection.find())
            self.reviews_df = pd.DataFrame(reviews_data)
            
            if not self.books_df.empty:
                self._prepare_content_data()
                self._create_user_item_matrix()
            else:
                print("Warning: Tidak ada data buku yang ditemukan")
                
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            self.books_df = pd.DataFrame()
            self.reviews_df = pd.DataFrame()
    
    def _prepare_content_data(self):
        """Mempersiapkan data untuk content-based filtering"""
        # Gabungkan semua informasi buku
        self.books_df['content'] = (
            self.books_df['title'].fillna('') + ' ' +
            self.books_df['description'].fillna('') + ' ' +
            self.books_df['author'].fillna('') + ' ' +
            self.books_df['genre'].fillna('')
        )
        
        # Buat TF-IDF matrix
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.books_df['content'])
    
    def _create_user_item_matrix(self):
        """Membuat user-item matrix untuk collaborative filtering"""
        if not self.reviews_df.empty:
            self.user_item_matrix = self.reviews_df.pivot(
                index='user_id',
                columns='book_id',
                values='rating'
            ).fillna(0)
        else:
            self.user_item_matrix = pd.DataFrame()
    
    def _get_book_index(self, book_id: str) -> Optional[int]:
        """Mendapatkan indeks buku dari DataFrame"""
        try:
            return self.books_df[self.books_df['_id'] == book_id].index[0]
        except (IndexError, KeyError):
            return None
    
    def _get_book_by_index(self, index: int) -> Optional[Dict[str, Any]]:
        """Mendapatkan data buku berdasarkan indeks"""
        try:
            book = self.books_df.iloc[index]
            return {
                'book_id': str(book['_id']),
                'title': book.get('title', 'N/A'),
                'author': book.get('author', 'N/A'),
                'genre': book.get('genre', 'N/A'),
                'description': book.get('description', 'N/A')
            }
        except (IndexError, KeyError):
            return None
    
    def get_content_based_recommendations(self, book_id: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Mendapatkan rekomendasi berdasarkan konten buku"""
        try:
            if self.books_df.empty or self.tfidf_matrix is None:
                return []
            
            book_idx = self._get_book_index(book_id)
            if book_idx is None:
                return []
            
            # Hitung similarity scores
            cosine_similarities = cosine_similarity(
                self.tfidf_matrix[book_idx:book_idx+1],
                self.tfidf_matrix
            ).flatten()
            
            # Dapatkan indeks buku yang paling similar (exclude buku yang sama)
            similar_indices = cosine_similarities.argsort()[-n_recommendations-1:-1][::-1]
            
            # Dapatkan detail buku yang direkomendasikan
            recommendations = []
            for idx in similar_indices:
                book_data = self._get_book_by_index(idx)
                if book_data:
                    book_data['similarity_score'] = float(cosine_similarities[idx])
                    recommendations.append(book_data)
            
            return recommendations
            
        except Exception as e:
            print(f"Error dalam content-based recommendations: {str(e)}")
            return []
    
    def get_collaborative_recommendations(self, user_id: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Mendapatkan rekomendasi berdasarkan collaborative filtering"""
        try:
            if self.user_item_matrix.empty or user_id not in self.user_item_matrix.index:
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
                book_data = self._get_book_by_id(book_id)
                if book_data:
                    book_data['predicted_rating'] = float(predicted_rating)
                    recommendations.append(book_data)
            
            return recommendations
            
        except Exception as e:
            print(f"Error dalam collaborative recommendations: {str(e)}")
            return []
    
    def _get_book_by_id(self, book_id: str) -> Optional[Dict[str, Any]]:
        """Mendapatkan data buku berdasarkan ID"""
        try:
            book = self.books_df[self.books_df['_id'] == book_id].iloc[0]
            return {
                'book_id': str(book['_id']),
                'title': book.get('title', 'N/A'),
                'author': book.get('author', 'N/A'),
                'genre': book.get('genre', 'N/A'),
                'description': book.get('description', 'N/A')
            }
        except (IndexError, KeyError):
            return None
    
    def get_ai_enhanced_recommendations(self, user_preferences: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Mendapatkan rekomendasi yang ditingkatkan dengan OpenAI"""
        try:
            if not openai.api_key or self.books_df.empty:
                return []
            
            # Gunakan OpenAI untuk menganalisis preferensi user
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Anda adalah asisten yang ahli dalam menganalisis preferensi buku. Berikan 5 kata kunci yang relevan untuk pencarian buku."},
                    {"role": "user", "content": f"Analisis preferensi buku berikut dan berikan 5 kata kunci yang relevan: {user_preferences}"}
                ],
                max_tokens=100
            )
            
            # Ekstrak kata kunci dari respons OpenAI
            keywords_text = response.choices[0].message.content.strip()
            keywords = [kw.strip() for kw in keywords_text.split('\n') if kw.strip()]
            
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
                book_data = self._get_book_by_index(idx)
                if book_data:
                    book_data['relevance_score'] = float(cosine_similarities[idx])
                    book_data['keywords'] = keywords
                    recommendations.append(book_data)
            
            return recommendations
            
        except Exception as e:
            print(f"Error dalam AI-enhanced recommendations: {str(e)}")
            return []
    
    def get_hybrid_recommendations(self, user_id: Optional[str] = None, book_id: Optional[str] = None, 
                                 user_preferences: Optional[str] = None, n_recommendations: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """Mendapatkan rekomendasi hybrid dari semua metode"""
        recommendations = {
            'content_based': [],
            'collaborative': [],
            'ai_enhanced': []
        }
        
        # Content-based recommendations
        if book_id:
            recommendations['content_based'] = self.get_content_based_recommendations(
                book_id, n_recommendations
            )
        
        # Collaborative filtering recommendations
        if user_id:
            recommendations['collaborative'] = self.get_collaborative_recommendations(
                user_id, n_recommendations
            )
        
        # AI-enhanced recommendations
        if user_preferences:
            recommendations['ai_enhanced'] = self.get_ai_enhanced_recommendations(
                user_preferences, n_recommendations
            )
        
        return recommendations
    
    def refresh_data(self):
        """Refresh data dari database"""
        self._load_data()
    
    def __del__(self):
        """Cleanup saat object dihapus"""
        if hasattr(self, 'client'):
            self.client.close() 