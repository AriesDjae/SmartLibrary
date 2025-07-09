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
        from utils.logger import ai_logger
        
        try:
            ai_logger.logger.info(f"📊 CONTENT-BASED: Processing book_id={book_id}")
            
            if self.books_df.empty or self.tfidf_matrix is None:
                ai_logger.logger.warning("   ⚠️  No data available for content-based filtering")
                return []
            
            book_idx = self._get_book_index(book_id)
            if book_idx is None:
                ai_logger.logger.warning(f"   ⚠️  Book ID {book_id} not found in database")
                return []
            
            ai_logger.logger.info(f"   📖 Found book at index {book_idx}")
            
            # Hitung similarity scores
            cosine_similarities = cosine_similarity(
                self.tfidf_matrix[book_idx:book_idx+1],
                self.tfidf_matrix
            ).flatten()
            
            ai_logger.logger.info(f"   🔢 Calculated {len(cosine_similarities)} similarity scores")
            ai_logger.logger.info(f"   📈 Score range: {cosine_similarities.min():.4f} - {cosine_similarities.max():.4f}")
            
            # Dapatkan indeks buku yang paling similar (exclude buku yang sama)
            similar_indices = cosine_similarities.argsort()[-n_recommendations-1:-1][::-1]
            
            ai_logger.logger.info(f"   🎯 Selected top {len(similar_indices)} similar books")
            
            # Dapatkan detail buku yang direkomendasikan
            recommendations = []
            for i, idx in enumerate(similar_indices, 1):
                book_data = self._get_book_by_index(idx)
                if book_data:
                    score = float(cosine_similarities[idx])
                    # Simpan score hanya untuk internal logging, tidak untuk user
                    book_data['_internal_similarity_score'] = score
                    # Hapus score dari response user
                    clean_book_data = {k: v for k, v in book_data.items() if not k.startswith('_')}
                    recommendations.append(clean_book_data)
                    ai_logger.logger.info(f"      {i}. {book_data.get('title', 'N/A')} - Score: {score:.4f}")
            
            ai_logger.logger.info(f"   ✅ Content-based: Generated {len(recommendations)} recommendations")
            return recommendations
            
        except Exception as e:
            ai_logger.log_error("ContentBasedRecommendation", str(e))
            return []
    
    def get_collaborative_recommendations(self, user_id: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Mendapatkan rekomendasi berdasarkan collaborative filtering"""
        from utils.logger import ai_logger
        
        try:
            ai_logger.logger.info(f"👥 COLLABORATIVE: Processing user_id={user_id}")
            
            if self.user_item_matrix.empty or user_id not in self.user_item_matrix.index:
                ai_logger.logger.warning(f"   ⚠️  User {user_id} not found or no user-item matrix available")
                return []
            
            ai_logger.logger.info(f"   👤 Found user in matrix with {len(self.user_item_matrix.columns)} books")
            
            # Hitung similarity antar user
            user_similarities = cosine_similarity(
                self.user_item_matrix.loc[user_id:user_id],
                self.user_item_matrix
            ).flatten()
            
            ai_logger.logger.info(f"   🔢 Calculated similarities with {len(user_similarities)} users")
            ai_logger.logger.info(f"   📈 Similarity range: {user_similarities.min():.4f} - {user_similarities.max():.4f}")
            
            # Dapatkan user yang paling similar
            similar_users = user_similarities.argsort()[-n_recommendations-1:-1][::-1]
            ai_logger.logger.info(f"   🎯 Selected top {len(similar_users)} similar users")
            
            # Log similar users
            for i, user_idx in enumerate(similar_users, 1):
                similarity = user_similarities[user_idx]
                ai_logger.logger.info(f"      {i}. User {user_idx} - Similarity: {similarity:.4f}")
            
            # Dapatkan buku yang belum dibaca oleh user
            user_books = set(self.user_item_matrix.columns[self.user_item_matrix.loc[user_id] > 0])
            all_books = set(self.user_item_matrix.columns)
            unread_books = all_books - user_books
            
            ai_logger.logger.info(f"   📚 User has read {len(user_books)} books, {len(unread_books)} unread books available")
            
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
            
            ai_logger.logger.info(f"   🧮 Calculated predictions for {len(predictions)} unread books")
            
            # Urutkan berdasarkan prediksi rating
            predictions.sort(key=lambda x: x[1], reverse=True)
            
            # Dapatkan detail buku yang direkomendasikan
            recommendations = []
            for i, (book_id, predicted_rating) in enumerate(predictions[:n_recommendations], 1):
                book_data = self._get_book_by_id(book_id)
                if book_data:
                    # Simpan rating hanya untuk internal logging, tidak untuk user
                    book_data['_internal_predicted_rating'] = float(predicted_rating)
                    # Hapus rating dari response user
                    clean_book_data = {k: v for k, v in book_data.items() if not k.startswith('_')}
                    recommendations.append(clean_book_data)
                    ai_logger.logger.info(f"      {i}. {book_data.get('title', 'N/A')} - Predicted Rating: {predicted_rating:.2f}")
            
            ai_logger.logger.info(f"   ✅ Collaborative: Generated {len(recommendations)} recommendations")
            return recommendations
            
        except Exception as e:
            ai_logger.log_error("CollaborativeRecommendation", str(e))
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
        from utils.logger import ai_logger
        
        try:
            ai_logger.logger.info(f"🤖 AI-ENHANCED: Processing user preferences")
            ai_logger.logger.info(f"   📝 User Preferences: {user_preferences[:100] + '...' if len(user_preferences) > 100 else user_preferences}")
            
            if not openai.api_key or self.books_df.empty:
                ai_logger.logger.warning("   ⚠️  OpenAI API key not available or no books data")
                return []
            
            ai_logger.logger.info("   🧠 Calling OpenAI API for keyword extraction...")
            
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
            
            ai_logger.logger.info(f"   🔑 Extracted keywords: {', '.join(keywords)}")
            
            # Tambahkan kata kunci ke query pencarian
            search_query = ' '.join(keywords)
            ai_logger.logger.info(f"   🔍 Search query: {search_query}")
            
            # Gunakan TF-IDF untuk mencari buku yang cocok
            query_vector = self.tfidf_vectorizer.transform([search_query])
            cosine_similarities = cosine_similarity(
                query_vector,
                self.tfidf_matrix
            ).flatten()
            
            ai_logger.logger.info(f"   🔢 Calculated {len(cosine_similarities)} relevance scores")
            ai_logger.logger.info(f"   📈 Relevance range: {cosine_similarities.min():.4f} - {cosine_similarities.max():.4f}")
            
            # Dapatkan indeks buku yang paling cocok
            similar_indices = cosine_similarities.argsort()[-n_recommendations:][::-1]
            ai_logger.logger.info(f"   🎯 Selected top {len(similar_indices)} relevant books")
            
            # Dapatkan detail buku yang direkomendasikan
            recommendations = []
            for i, idx in enumerate(similar_indices, 1):
                book_data = self._get_book_by_index(idx)
                if book_data:
                    relevance_score = float(cosine_similarities[idx])
                    # Simpan score dan keywords hanya untuk internal logging
                    book_data['_internal_relevance_score'] = relevance_score
                    book_data['_internal_keywords'] = keywords
                    # Hapus score dan keywords dari response user
                    clean_book_data = {k: v for k, v in book_data.items() if not k.startswith('_')}
                    recommendations.append(clean_book_data)
                    ai_logger.logger.info(f"      {i}. {book_data.get('title', 'N/A')} - Relevance: {relevance_score:.4f}")
                    ai_logger.logger.info(f"         Keywords: {', '.join(keywords)}")
            
            ai_logger.logger.info(f"   ✅ AI-Enhanced: Generated {len(recommendations)} recommendations")
            return recommendations
            
        except Exception as e:
            ai_logger.log_error("AIEnhancedRecommendation", str(e))
            return []
    
    def get_hybrid_recommendations(self, user_id: Optional[str] = None, book_id: Optional[str] = None, 
                                 user_preferences: Optional[str] = None, n_recommendations: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """Mendapatkan rekomendasi hybrid dari semua metode"""
        import time
        from utils.logger import ai_logger
        
        start_time = time.time()
        
        # Log request
        ai_logger.logger.info(f"🔍 HYBRID RECOMMENDATION REQUEST")
        ai_logger.logger.info(f"   User ID: {user_id or 'None'}")
        ai_logger.logger.info(f"   Book ID: {book_id or 'None'}")
        ai_logger.logger.info(f"   User Preferences: {user_preferences[:100] + '...' if user_preferences and len(user_preferences) > 100 else user_preferences or 'None'}")
        ai_logger.logger.info(f"   N Recommendations: {n_recommendations}")
        
        recommendations = {
            'content_based': [],
            'collaborative': [],
            'ai_enhanced': []
        }
        
        # Content-based recommendations
        if book_id:
            ai_logger.logger.info(f"📊 Generating Content-Based Recommendations for book: {book_id}")
            content_start = time.time()
            recommendations['content_based'] = self.get_content_based_recommendations(
                book_id, n_recommendations
            )
            content_time = time.time() - content_start
            ai_logger.logger.info(f"   ✅ Content-Based: {len(recommendations['content_based'])} recommendations in {content_time:.3f}s")
            
            # Log scoring details (menggunakan internal data)
            for i, rec in enumerate(recommendations['content_based'], 1):
                # Ambil score dari internal data untuk logging
                internal_score = getattr(rec, '_internal_similarity_score', 0)
                ai_logger.logger.info(f"      {i}. {rec.get('title', 'N/A')} - Score: {internal_score:.4f}")
        
        # Collaborative filtering recommendations
        if user_id:
            ai_logger.logger.info(f"👥 Generating Collaborative Recommendations for user: {user_id}")
            collab_start = time.time()
            recommendations['collaborative'] = self.get_collaborative_recommendations(
                user_id, n_recommendations
            )
            collab_time = time.time() - collab_start
            ai_logger.logger.info(f"   ✅ Collaborative: {len(recommendations['collaborative'])} recommendations in {collab_time:.3f}s")
            
            # Log scoring details (menggunakan internal data)
            for i, rec in enumerate(recommendations['collaborative'], 1):
                # Ambil rating dari internal data untuk logging
                internal_rating = getattr(rec, '_internal_predicted_rating', 0)
                ai_logger.logger.info(f"      {i}. {rec.get('title', 'N/A')} - Predicted Rating: {internal_rating:.2f}")
        
        # AI-enhanced recommendations
        if user_preferences:
            ai_logger.logger.info(f"🤖 Generating AI-Enhanced Recommendations")
            ai_start = time.time()
            recommendations['ai_enhanced'] = self.get_ai_enhanced_recommendations(
                user_preferences, n_recommendations
            )
            ai_time = time.time() - ai_start
            ai_logger.logger.info(f"   ✅ AI-Enhanced: {len(recommendations['ai_enhanced'])} recommendations in {ai_time:.3f}s")
            
            # Log scoring details (menggunakan internal data)
            for i, rec in enumerate(recommendations['ai_enhanced'], 1):
                # Ambil score dan keywords dari internal data untuk logging
                internal_relevance = getattr(rec, '_internal_relevance_score', 0)
                internal_keywords = getattr(rec, '_internal_keywords', [])
                ai_logger.logger.info(f"      {i}. {rec.get('title', 'N/A')} - Relevance Score: {internal_relevance:.4f}")
                if internal_keywords:
                    ai_logger.logger.info(f"         Keywords: {', '.join(internal_keywords)}")
        
        # Calculate total time
        total_time = time.time() - start_time
        
        # Log summary
        total_recommendations = sum(len(recs) for recs in recommendations.values())
        ai_logger.logger.info(f"🎯 HYBRID RECOMMENDATION SUMMARY")
        ai_logger.logger.info(f"   Total Recommendations: {total_recommendations}")
        ai_logger.logger.info(f"   Content-Based: {len(recommendations['content_based'])}")
        ai_logger.logger.info(f"   Collaborative: {len(recommendations['collaborative'])}")
        ai_logger.logger.info(f"   AI-Enhanced: {len(recommendations['ai_enhanced'])}")
        ai_logger.logger.info(f"   Total Time: {total_time:.3f}s")
        
        # Log performance metrics
        ai_logger.log_performance("HybridRecommendation", "generate", total_time)
        
        return recommendations
    
    def refresh_data(self):
        """Refresh data dari database"""
        self._load_data()
    
    def __del__(self):
        """Cleanup saat object dihapus"""
        if hasattr(self, 'client'):
            self.client.close() 