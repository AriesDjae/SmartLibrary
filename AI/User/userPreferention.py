import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class UserPreferenceAnalyzer:
    def __init__(self):
        # Koneksi ke MongoDB
        self.client = MongoClient(os.getenv('MONGODB_URI'))
        self.db = self.client['smartlibrary']
        self.books_collection = self.db['books']
        self.user_preferences_collection = self.db['user_preferences']
        
        # Inisialisasi vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000
        )
        
        # Load data
        self.load_data()
    
    def load_data(self):
        """Load data dari MongoDB"""
        # Load buku
        self.books_df = pd.DataFrame(list(self.books_collection.find()))
        
        # Persiapkan data untuk content-based filtering
        self.books_df['content'] = self.books_df['title'] + ' ' + \
                                 self.books_df['description'] + ' ' + \
                                 self.books_df['author'] + ' ' + \
                                 self.books_df['genre']
        
        # Buat TF-IDF matrix
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.books_df['content'])
    
    def analyze_user_preferences(self, user_id: str) -> dict:
        """Menganalisis preferensi pengguna berdasarkan riwayat membaca"""
        # Ambil riwayat membaca user
        user_history = list(self.user_preferences_collection.find({'user_id': user_id}))
        
        if not user_history:
            return {
                'preferred_genres': [],
                'preferred_authors': [],
                'preferred_topics': []
            }
        
        # Konversi ke DataFrame
        history_df = pd.DataFrame(user_history)
        
        # Analisis genre
        preferred_genres = history_df['genre'].value_counts().head(3).index.tolist()
        
        # Analisis penulis
        preferred_authors = history_df['author'].value_counts().head(3).index.tolist()
        
        # Analisis topik berdasarkan deskripsi buku
        book_descriptions = ' '.join(history_df['description'].tolist())
        topic_vector = self.tfidf_vectorizer.transform([book_descriptions])
        topic_similarities = cosine_similarity(topic_vector, self.tfidf_matrix).flatten()
        similar_indices = topic_similarities.argsort()[-3:][::-1]
        preferred_topics = self.books_df.iloc[similar_indices]['genre'].tolist()
        
        return {
            'preferred_genres': preferred_genres,
            'preferred_authors': preferred_authors,
            'preferred_topics': preferred_topics
        }
    
    def get_user_preference_vector(self, user_id: str) -> np.ndarray:
        """Mendapatkan vektor preferensi pengguna"""
        preferences = self.analyze_user_preferences(user_id)
        
        # Gabungkan semua preferensi menjadi satu string
        preference_text = ' '.join(preferences['preferred_genres']) + ' ' + \
                         ' '.join(preferences['preferred_authors']) + ' ' + \
                         ' '.join(preferences['preferred_topics'])
        
        # Transformasi ke vektor TF-IDF
        preference_vector = self.tfidf_vectorizer.transform([preference_text])
        
        return preference_vector
    
    def find_similar_users(self, user_id: str, n_similar_users: int = 5) -> list:
        """Mencari pengguna yang memiliki preferensi serupa"""
        user_vector = self.get_user_preference_vector(user_id)
        
        # Hitung similarity dengan semua buku
        similarities = cosine_similarity(user_vector, self.tfidf_matrix).flatten()
        
        # Dapatkan indeks buku yang paling similar
        similar_indices = similarities.argsort()[-n_similar_users:][::-1]
        
        # Dapatkan detail buku yang similar
        similar_books = self.books_df.iloc[similar_indices]
        
        return similar_books.to_dict('records')
