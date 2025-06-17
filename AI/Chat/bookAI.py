import openai
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from ..Recomendation.recomnedationBooks import BookRecommender
from ..User.userPreferention import UserPreferenceAnalyzer

# Load environment variables
load_dotenv()

class BookAI:
    def __init__(self):
        # Konfigurasi OpenAI
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Inisialisasi komponen rekomendasi
        self.book_recommender = BookRecommender()
        self.user_analyzer = UserPreferenceAnalyzer()
        
        # Koneksi ke MongoDB
        self.client = MongoClient(os.getenv('MONGODB_URI'))
        self.db = self.client['smartlibrary']
        self.books_collection = self.db['books']
        
        # Konteks percakapan
        self.conversation_history = []
    
    def _get_book_context(self, book_id: str = None) -> str:
        """Mendapatkan konteks buku dari database"""
        if book_id:
            book = self.books_collection.find_one({'_id': book_id})
            if book:
                return f"""
                Judul: {book['title']}
                Penulis: {book['author']}
                Genre: {book['genre']}
                Deskripsi: {book['description']}
                """
        return ""
    
    def _get_user_context(self, user_id: str = None) -> str:
        """Mendapatkan konteks preferensi pengguna"""
        if user_id:
            preferences = self.user_analyzer.analyze_user_preferences(user_id)
            return f"""
            Genre Favorit: {', '.join(preferences['preferred_genres'])}
            Penulis Favorit: {', '.join(preferences['preferred_authors'])}
            Topik Favorit: {', '.join(preferences['preferred_topics'])}
            """
        return ""
    
    def chat(self, message: str, user_id: str = None, book_id: str = None) -> str:
        """Berinteraksi dengan AI untuk rekomendasi buku"""
        # Tambahkan pesan ke riwayat percakapan
        self.conversation_history.append({"role": "user", "content": message})
        
        # Siapkan konteks
        book_context = self._get_book_context(book_id)
        user_context = self._get_user_context(user_id)
        
        # Siapkan sistem prompt
        system_prompt = f"""Anda adalah asisten perpustakaan cerdas yang dapat memberikan rekomendasi buku.
        Anda memiliki akses ke database buku dan dapat memahami preferensi pengguna.
        
        Konteks Buku:
        {book_context}
        
        Konteks Pengguna:
        {user_context}
        
        Berikan rekomendasi yang personal dan relevan berdasarkan konteks di atas.
        """
        
        # Siapkan pesan untuk OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
            *self.conversation_history
        ]
        
        try:
            # Dapatkan respons dari OpenAI
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            # Ambil respons
            ai_response = response.choices[0].message.content
            
            # Tambahkan respons ke riwayat percakapan
            self.conversation_history.append({"role": "assistant", "content": ai_response})
            
            # Jika ada rekomendasi buku, tambahkan ke respons
            if user_id:
                recommendations = self.book_recommender.get_hybrid_recommendations(
                    user_id=user_id,
                    book_id=book_id,
                    n_recommendations=3
                )
                
                if any(recommendations.values()):
                    ai_response += "\n\nRekomendasi Buku:\n"
                    for method, recs in recommendations.items():
                        if recs:
                            ai_response += f"\nBerdasarkan {method}:\n"
                            for rec in recs:
                                ai_response += f"- {rec['title']} oleh {rec['author']}\n"
            
            return ai_response
            
        except Exception as e:
            return f"Maaf, terjadi kesalahan: {str(e)}"
    
    def clear_conversation_history(self):
        """Membersihkan riwayat percakapan"""
        self.conversation_history = []

# Contoh penggunaan
if __name__ == "__main__":
    book_ai = BookAI()
    
    # Contoh percakapan
    response = book_ai.chat(
        "Saya suka novel fiksi ilmiah dengan tema perjalanan waktu",
        user_id="user123"
    )
    print(response) 