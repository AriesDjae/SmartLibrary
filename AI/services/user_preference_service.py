import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class UserPreferenceService:
    """Service class untuk menganalisis preferensi pengguna"""
    
    def __init__(self):
        """Inisialisasi UserPreference Service"""
        self._setup_database()
        self._setup_ml_components()
        self._load_data()
    
    def _setup_database(self):
        """Setup koneksi database"""
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            raise ValueError("MONGODB_URI tidak ditemukan di environment variables")
        
        self.client = MongoClient(mongodb_uri)
        self.db = self.client['smartlibrary']
        self.books_collection = self.db['books']
        self.ratings_collection = self.db['ratings']
        self.reading_history_collection = self.db['reading_history']
        self.user_interactions_collection = self.db['user_interactions']
    
    def _setup_ml_components(self):
        """Setup komponen machine learning"""
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2)
        )
    
    def _load_data(self):
        """Load data dari MongoDB"""
        try:
            # Load buku
            books_data = list(self.books_collection.find())
            self.books_df = pd.DataFrame(books_data)
            
            # Load ratings
            ratings_data = list(self.ratings_collection.find())
            self.ratings_df = pd.DataFrame(ratings_data)
            
            # Load reading history
            reading_history_data = list(self.reading_history_collection.find())
            self.reading_history_df = pd.DataFrame(reading_history_data)
            
            # Load user interactions
            user_interactions_data = list(self.user_interactions_collection.find())
            self.user_interactions_df = pd.DataFrame(user_interactions_data)
            
            if not self.books_df.empty:
                self._prepare_content_data()
            else:
                print("Warning: Tidak ada data buku yang ditemukan")
                
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            self.books_df = pd.DataFrame()
            self.ratings_df = pd.DataFrame()
            self.reading_history_df = pd.DataFrame()
            self.user_interactions_df = pd.DataFrame()
    
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
    
    def _get_user_history(self, user_id: str) -> pd.DataFrame:
        """Mendapatkan riwayat membaca user"""
        try:
            # Cari dari ratings (sebagai riwayat utama)
            user_ratings = self.ratings_df[self.ratings_df['user_id'] == user_id]
            if not user_ratings.empty:
                user_history = user_ratings.merge(
                    self.books_df[['_id', 'title', 'author', 'genre', 'description']],
                    left_on='book_id',
                    right_on='_id',
                    how='left'
                )
                return user_history
            # Jika tidak ada di ratings, cari dari reading_history
            user_reading = self.reading_history_df[self.reading_history_df['user_id'] == user_id]
            if not user_reading.empty:
                user_history = user_reading.merge(
                    self.books_df[['_id', 'title', 'author', 'genre', 'description']],
                    left_on='book_id',
                    right_on='_id',
                    how='left'
                )
                return user_history
            return pd.DataFrame()
        except Exception as e:
            print(f"Error mendapatkan riwayat user: {str(e)}")
            return pd.DataFrame()
    
    def analyze_user_preferences(self, user_id: str) -> Dict[str, List[str]]:
        """Menganalisis preferensi pengguna berdasarkan riwayat membaca"""
        try:
            user_history = self._get_user_history(user_id)
            
            if user_history.empty:
                return {
                    'preferred_genres': [],
                    'preferred_authors': [],
                    'preferred_topics': [],
                    'reading_patterns': {},
                    'total_books_read': 0
                }
            
            # Analisis genre
            preferred_genres = []
            if 'genre' in user_history.columns:
                genre_counts = user_history['genre'].value_counts()
                preferred_genres = genre_counts.head(5).index.tolist()
            
            # Analisis penulis
            preferred_authors = []
            if 'author' in user_history.columns:
                author_counts = user_history['author'].value_counts()
                preferred_authors = author_counts.head(5).index.tolist()
            
            # Analisis topik berdasarkan deskripsi buku
            preferred_topics = []
            if 'description' in user_history.columns:
                book_descriptions = ' '.join(user_history['description'].fillna('').tolist())
                if book_descriptions.strip():
                    topic_vector = self.tfidf_vectorizer.transform([book_descriptions])
                    topic_similarities = cosine_similarity(topic_vector, self.tfidf_matrix).flatten()
                    similar_indices = topic_similarities.argsort()[-3:][::-1]
                    preferred_topics = self.books_df.iloc[similar_indices]['genre'].tolist()
            
            # Analisis pola membaca
            reading_patterns = {}
            if 'rating' in user_history.columns:
                reading_patterns = {
                    'average_rating': float(user_history['rating'].mean()),
                    'total_ratings': int(user_history['rating'].count()),
                    'rating_distribution': user_history['rating'].value_counts().to_dict()
                }
            
            return {
                'preferred_genres': preferred_genres,
                'preferred_authors': preferred_authors,
                'preferred_topics': preferred_topics,
                'reading_patterns': reading_patterns,
                'total_books_read': len(user_history)
            }
            
        except Exception as e:
            print(f"Error menganalisis preferensi user: {str(e)}")
            return {
                'preferred_genres': [],
                'preferred_authors': [],
                'preferred_topics': [],
                'reading_patterns': {},
                'total_books_read': 0
            }
    
    def get_user_preference_vector(self, user_id: str) -> Optional[np.ndarray]:
        """Mendapatkan vektor preferensi pengguna"""
        try:
            preferences = self.analyze_user_preferences(user_id)
            
            # Gabungkan semua preferensi menjadi satu string
            preference_text = ' '.join(preferences['preferred_genres']) + ' ' + \
                             ' '.join(preferences['preferred_authors']) + ' ' + \
                             ' '.join(preferences['preferred_topics'])
            
            if not preference_text.strip():
                return None
            
            # Transformasi ke vektor TF-IDF
            preference_vector = self.tfidf_vectorizer.transform([preference_text])
            
            return preference_vector
            
        except Exception as e:
            print(f"Error mendapatkan vektor preferensi user: {str(e)}")
            return None
    
    def find_similar_users(self, user_id: str, n_similar_users: int = 5) -> List[Dict[str, Any]]:
        """Mencari pengguna yang memiliki preferensi serupa"""
        try:
            user_vector = self.get_user_preference_vector(user_id)
            
            if user_vector is None or self.tfidf_matrix is None:
                return []
            
            # Hitung similarity dengan semua buku
            similarities = cosine_similarity(user_vector, self.tfidf_matrix).flatten()
            
            # Dapatkan indeks buku yang paling similar
            similar_indices = similarities.argsort()[-n_similar_users:][::-1]
            
            # Dapatkan detail buku yang similar
            similar_books = []
            for idx in similar_indices:
                book_data = self._get_book_by_index(idx)
                if book_data:
                    book_data['similarity_score'] = float(similarities[idx])
                    similar_books.append(book_data)
            
            return similar_books
            
        except Exception as e:
            print(f"Error mencari user serupa: {str(e)}")
            return []
    
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
    
    def get_user_reading_stats(self, user_id: str) -> Dict[str, Any]:
        """Mendapatkan statistik membaca pengguna"""
        try:
            user_history = self._get_user_history(user_id)
            
            if user_history.empty:
                return {
                    'total_books': 0,
                    'average_rating': 0,
                    'favorite_genre': None,
                    'favorite_author': None,
                    'reading_streak': 0
                }
            
            stats = {
                'total_books': len(user_history),
                'average_rating': float(user_history['rating'].mean()) if 'rating' in user_history.columns else 0,
                'favorite_genre': user_history['genre'].mode().iloc[0] if 'genre' in user_history.columns else None,
                'favorite_author': user_history['author'].mode().iloc[0] if 'author' in user_history.columns else None,
                'reading_streak': 0  # TODO: Implement reading streak calculation
            }
            
            return stats
            
        except Exception as e:
            print(f"Error mendapatkan statistik membaca: {str(e)}")
            return {
                'total_books': 0,
                'average_rating': 0,
                'favorite_genre': None,
                'favorite_author': None,
                'reading_streak': 0
            }
    
    def update_user_preferences(self, user_id: str, book_data: Dict[str, Any]):
        """Memperbarui preferensi pengguna berdasarkan buku yang dibaca"""
        try:
            # Simpan preferensi baru ke database
            preference_data = {
                'user_id': user_id,
                'book_id': book_data.get('book_id'),
                'title': book_data.get('title'),
                'author': book_data.get('author'),
                'genre': book_data.get('genre'),
                'description': book_data.get('description'),
                'rating': book_data.get('rating', 0),
                'timestamp': pd.Timestamp.now()
            }
            
            self.ratings_collection.insert_one(preference_data)
            
            # Refresh data
            self._load_data()
            
        except Exception as e:
            print(f"Error memperbarui preferensi user: {str(e)}")
    
    def refresh_data(self):
        """Refresh data dari database"""
        self._load_data()
    
    def __del__(self):
        """Cleanup saat object dihapus"""
        if hasattr(self, 'client'):
            self.client.close() 