import openai
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from .recommendation_service import RecommendationService
from .user_preference_service import UserPreferenceService

# Load environment variables
load_dotenv()

class BookAIService:
    """Service class untuk menangani interaksi AI dengan buku"""
    
    def __init__(self):
        """Inisialisasi BookAI Service"""
        self._setup_openai()
        self._setup_database()
        self._setup_services()
        self._conversation_histories = {}  # Dictionary untuk menyimpan riwayat per user
    
    def _setup_openai(self):
        """Setup konfigurasi OpenAI"""
        openai.api_key = os.getenv('OPENAI_API_KEY')
        if not openai.api_key:
            raise ValueError("OPENAI_API_KEY tidak ditemukan di environment variables")
    
    def _setup_database(self):
        """Setup koneksi database"""
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            raise ValueError("MONGODB_URI tidak ditemukan di environment variables")
        
        self.client = MongoClient(mongodb_uri)
        self.db = self.client['smartlibrary']
        self.books_collection = self.db['books']
    
    def _setup_services(self):
        """Setup service dependencies"""
        self.recommendation_service = RecommendationService()
        self.user_preference_service = UserPreferenceService()
    
    def _get_book_context(self, book_id: str) -> str:
        """Mendapatkan konteks buku dari database"""
        if not book_id:
            return ""
        
        try:
            book = self.books_collection.find_one({'_id': book_id})
            if book:
                return f"""
                Judul: {book.get('title', 'N/A')}
                Penulis: {book.get('author', 'N/A')}
                Genre: {book.get('genre', 'N/A')}
                Deskripsi: {book.get('description', 'N/A')}
                """
        except Exception as e:
            print(f"Error mendapatkan konteks buku: {str(e)}")
        
        return ""
    
    def _get_user_context(self, user_id: str) -> str:
        """Mendapatkan konteks preferensi pengguna"""
        if not user_id:
            return ""
        
        try:
            preferences = self.user_preference_service.analyze_user_preferences(user_id)
            return f"""
            Genre Favorit: {', '.join(preferences.get('preferred_genres', []))}
            Penulis Favorit: {', '.join(preferences.get('preferred_authors', []))}
            Topik Favorit: {', '.join(preferences.get('preferred_topics', []))}
            """
        except Exception as e:
            print(f"Error mendapatkan konteks user: {str(e)}")
        
        return ""
    
    def _get_conversation_history(self, user_id: str) -> List[Dict[str, str]]:
        """Mendapatkan riwayat percakapan untuk user tertentu"""
        return self._conversation_histories.get(user_id, [])
    
    def _add_to_conversation_history(self, user_id: str, role: str, content: str):
        """Menambahkan pesan ke riwayat percakapan"""
        if user_id not in self._conversation_histories:
            self._conversation_histories[user_id] = []
        
        self._conversation_histories[user_id].append({
            "role": role,
            "content": content
        })
        
        # Batasi riwayat percakapan (maksimal 10 pesan)
        if len(self._conversation_histories[user_id]) > 10:
            self._conversation_histories[user_id] = self._conversation_histories[user_id][-10:]
    
    def _create_system_prompt(self, book_context: str, user_context: str) -> str:
        """Membuat sistem prompt untuk OpenAI"""
        return f"""Anda adalah asisten perpustakaan cerdas yang dapat memberikan rekomendasi buku.
        Anda memiliki akses ke database buku dan dapat memahami preferensi pengguna.
        
        Konteks Buku:
        {book_context}
        
        Konteks Pengguna:
        {user_context}
        
        Berikan rekomendasi yang personal dan relevan berdasarkan konteks di atas.
        Jawab dalam bahasa Indonesia yang sopan dan informatif.
        """
    
    def _get_ai_response(self, messages: List[Dict[str, str]]) -> str:
        """Mendapatkan respons dari OpenAI"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Maaf, terjadi kesalahan dalam memproses permintaan: {str(e)}"
    
    def _add_recommendations_to_response(self, response: str, user_id: str, book_id: str) -> str:
        """Menambahkan rekomendasi buku ke respons AI"""
        try:
            if user_id or book_id:
                recommendations = self.recommendation_service.get_hybrid_recommendations(
                    user_id=user_id,
                    book_id=book_id,
                    n_recommendations=3
                )
                
                if any(recommendations.values()):
                    response += "\n\n📚 Rekomendasi Buku:\n"
                    for method, recs in recommendations.items():
                        if recs:
                            method_name = {
                                'content_based': 'Berdasarkan Konten Serupa',
                                'collaborative': 'Berdasarkan Pengguna Lain',
                                'ai_enhanced': 'Berdasarkan AI'
                            }.get(method, method)
                            
                            response += f"\n{method_name}:\n"
                            for rec in recs:
                                response += f"• {rec.get('title', 'N/A')} oleh {rec.get('author', 'N/A')}\n"
        except Exception as e:
            print(f"Error menambahkan rekomendasi: {str(e)}")
        
        return response
    
    def chat(self, message: str, user_id: Optional[str] = None, book_id: Optional[str] = None) -> str:
        """Berinteraksi dengan AI untuk rekomendasi buku"""
        try:
            # Tambahkan pesan user ke riwayat
            self._add_to_conversation_history(user_id or "anonymous", "user", message)
            
            # Siapkan konteks
            book_context = self._get_book_context(book_id)
            user_context = self._get_user_context(user_id)
            
            # Buat sistem prompt
            system_prompt = self._create_system_prompt(book_context, user_context)
            
            # Siapkan pesan untuk OpenAI
            conversation_history = self._get_conversation_history(user_id or "anonymous")
            messages = [
                {"role": "system", "content": system_prompt},
                *conversation_history
            ]
            
            # Dapatkan respons dari AI
            ai_response = self._get_ai_response(messages)
            
            # Tambahkan respons ke riwayat
            self._add_to_conversation_history(user_id or "anonymous", "assistant", ai_response)
            
            # Tambahkan rekomendasi buku
            final_response = self._add_recommendations_to_response(ai_response, user_id, book_id)
            
            return final_response
            
        except Exception as e:
            return f"Maaf, terjadi kesalahan: {str(e)}"
    
    def clear_conversation_history(self, user_id: str):
        """Membersihkan riwayat percakapan untuk user tertentu"""
        if user_id in self._conversation_histories:
            del self._conversation_histories[user_id]
    
    def get_conversation_history(self, user_id: str) -> List[Dict[str, str]]:
        """Mendapatkan riwayat percakapan untuk user tertentu"""
        return self._get_conversation_history(user_id)
    
    def __del__(self):
        """Cleanup saat object dihapus"""
        if hasattr(self, 'client'):
            self.client.close() 