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
        # Pastikan dependency sudah sesuai hasil refactor
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
        return f"""Anda adalah asisten perpustakaan cerdas bernama "SmartLib Assistant" yang dapat memberikan rekomendasi buku yang personal dan akurat.

## PERAN DAN KEMAMPUAN:
- Ahli dalam menganalisis preferensi membaca pengguna
- Mengenal berbagai genre buku dan penulis
- Dapat memberikan rekomendasi yang sesuai dengan mood dan kebutuhan
- Memahami konteks buku yang sedang dibaca atau diminati

## KONTEKS YANG TERSEDIA:
Konteks Buku:
{book_context}

Konteks Pengguna:
{user_context}

## PANDUAN RESPONS:
1. **Sambutan Personal**: Mulai dengan sambutan yang ramah dan personal
2. **Analisis Preferensi**: Analisis preferensi pengguna berdasarkan konteks
3. **Rekomendasi Kontekstual**: Berikan rekomendasi yang sesuai dengan buku yang sedang dibaca
4. **Penjelasan Alasan**: Jelaskan mengapa buku tersebut direkomendasikan
5. **Saran Tambahan**: Berikan saran untuk eksplorasi genre atau penulis serupa
6. **Tone**: Gunakan bahasa Indonesia yang sopan, informatif, dan friendly

## FORMAT RESPONS:
- Gunakan emoji yang relevan untuk membuat respons lebih menarik
- Berikan penjelasan singkat untuk setiap rekomendasi
- Akhiri dengan ajakan untuk bertanya lebih lanjut

## CONTOH RESPONS YANG BAIK:
"Hi! 👋 Senang bertemu dengan pecinta buku! 

Berdasarkan preferensi Anda yang menyukai novel fiksi ilmiah, saya melihat Anda memiliki selera yang sophisticated. Novel-novel yang Anda sukai cenderung mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru.

Untuk buku yang sedang Anda baca, saya merekomendasikan beberapa novel yang serupa dalam hal tema dan gaya penulisan. Novel-novel ini juga mengeksplorasi teknologi masa depan dengan pendekatan yang unik.

Apakah Anda tertarik untuk mencoba genre lain yang masih dalam ranah fiksi ilmiah, atau ingin tetap fokus pada tema teknologi masa depan?"

## HAL YANG TIDAK BOLEH DILAKUKAN:
- Jangan memberikan spoiler untuk buku yang belum dibaca
- Jangan memaksa rekomendasi yang tidak sesuai preferensi
- Jangan memberikan informasi yang tidak akurat tentang buku
- Jangan menggunakan bahasa yang terlalu formal atau kaku
"""
    
    def _get_ai_response(self, messages: List[Dict[str, str]]) -> str:
        """Mendapatkan respons dari OpenAI"""
        try:
            # Tambahkan negative prompt untuk mencegah respons yang tidak diinginkan
            negative_prompt = """JANGAN:
- Berikan spoiler untuk buku yang belum dibaca
- Gunakan bahasa yang terlalu formal atau kaku
- Berikan rekomendasi yang tidak sesuai dengan preferensi pengguna
- Berikan informasi yang tidak akurat tentang buku
- Gunakan bahasa yang tidak sopan atau tidak profesional
- Berikan respons yang terlalu pendek atau tidak informatif
- Mengabaikan konteks buku atau preferensi pengguna
- Berikan rekomendasi yang terlalu generik tanpa penjelasan
- Gunakan emoji yang tidak relevan atau berlebihan
- Berikan respons yang tidak dalam bahasa Indonesia"""
            
            # Tambahkan negative prompt ke messages
            messages_with_negative = messages + [
                {"role": "system", "content": negative_prompt}
            ]
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages_with_negative,
                temperature=0.7,
                max_tokens=800,
                presence_penalty=0.1,  # Mendorong variasi dalam respons
                frequency_penalty=0.1   # Mengurangi repetisi
            )
            
            ai_response = response.choices[0].message.content
            
            # Post-processing untuk memastikan respons sesuai standar
            ai_response = self._post_process_response(ai_response)
            
            return ai_response
            
        except Exception as e:
            return f"Maaf, terjadi kesalahan dalam memproses permintaan: {str(e)}"
    
    def _post_process_response(self, response: str) -> str:
        """Post-processing untuk memastikan respons sesuai standar"""
        # Pastikan respons tidak kosong
        if not response or not response.strip():
            return "Maaf, saya tidak dapat memberikan respons yang tepat saat ini. Silakan coba lagi."
        
        # Pastikan respons dalam bahasa Indonesia
        if not self._is_indonesian_text(response):
            return "Maaf, terjadi kesalahan dalam bahasa. Silakan coba lagi."
        
        # Batasi panjang respons
        if len(response) > 1000:
            response = response[:1000] + "..."
        
        # Pastikan respons diakhiri dengan ajakan untuk bertanya lebih lanjut
        if not any(phrase in response.lower() for phrase in ['bertanya', 'tanya', 'lanjut', 'lain', '?']):
            response += "\n\nAda yang ingin Anda tanyakan lebih lanjut tentang rekomendasi buku?"
        
        return response
    
    def _is_indonesian_text(self, text: str) -> bool:
        """Cek apakah teks dalam bahasa Indonesia"""
        # Kata-kata umum dalam bahasa Indonesia
        indonesian_words = [
            'yang', 'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'oleh',
            'buku', 'novel', 'cerita', 'penulis', 'genre', 'rekomendasi', 'suka', 'bagus',
            'menarik', 'baik', 'jika', 'karena', 'seperti', 'juga', 'dapat', 'akan', 'sudah'
        ]
        
        text_lower = text.lower()
        indonesian_count = sum(1 for word in indonesian_words if word in text_lower)
        
        # Jika minimal 3 kata Indonesia ditemukan, anggap sebagai teks Indonesia
        return indonesian_count >= 3
    
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
                    response += "\n\n📚 **REKOMENDASI BUKU UNTUK ANDA** 📚\n"
                    response += "=" * 50 + "\n"
                    
                    for method, recs in recommendations.items():
                        if recs:
                            method_name = {
                                'content_based': '🎯 Berdasarkan Konten Serupa',
                                'collaborative': '👥 Berdasarkan Pengguna Lain',
                                'ai_enhanced': '🤖 Berdasarkan AI'
                            }.get(method, method)
                            
                            response += f"\n{method_name}:\n"
                            response += "-" * 30 + "\n"
                            
                            for i, rec in enumerate(recs, 1):
                                title = rec.get('title', 'N/A')
                                author = rec.get('author', 'N/A')
                                genre = rec.get('genre', 'N/A')
                                
                                # Tambahkan deskripsi singkat berdasarkan genre
                                genre_description = self._get_genre_description(genre)
                                
                                response += f"{i}. **{title}** oleh {author}\n"
                                response += f"   📖 Genre: {genre}\n"
                                response += f"   💡 {genre_description}\n\n"
                    
                    response += "=" * 50 + "\n"
                    response += "💡 **Tips**: Setiap rekomendasi dipilih berdasarkan algoritma yang berbeda untuk memberikan variasi yang menarik!\n\n"
        except Exception as e:
            print(f"Error menambahkan rekomendasi: {str(e)}")
        
        return response
    
    def _get_genre_description(self, genre: str) -> str:
        """Mendapatkan deskripsi singkat untuk genre"""
        genre_descriptions = {
            'Fiksi Ilmiah': 'Mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru',
            'Fantasi': 'Dunia magis dengan petualangan yang menakjubkan',
            'Misteri': 'Cerita detektif dengan teka-teki yang menegangkan',
            'Romansa': 'Kisah cinta yang mengharukan dan romantis',
            'Thriller': 'Cerita seru dengan ketegangan yang tinggi',
            'Sejarah': 'Mengajak kembali ke masa lalu dengan detail yang akurat',
            'Biografi': 'Kisah inspiratif dari tokoh-tokoh terkenal',
            'Self-Help': 'Buku motivasi untuk pengembangan diri',
            'Teknologi': 'Membahas inovasi dan perkembangan teknologi terkini',
            'Filsafat': 'Mengajak berpikir mendalam tentang kehidupan'
        }
        
        return genre_descriptions.get(genre, 'Cerita yang menarik dan menghibur')
    
    def chat(self, message: str, user_id: Optional[str] = None, book_id: Optional[str] = None) -> str:
        """Berinteraksi dengan AI untuk rekomendasi buku"""
        try:
            # Validasi input
            if not message or not message.strip():
                return "Pesan tidak boleh kosong"
            
            # Sanitasi input
            message = self._sanitize_input(message)
            user_id = self._sanitize_user_id(user_id)
            book_id = self._sanitize_book_id(book_id)
            
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
            
            # Log interaksi untuk monitoring
            self._log_chat_interaction(user_id, message, final_response)
            
            return final_response
            
        except Exception as e:
            error_msg = f"Maaf, terjadi kesalahan: {str(e)}"
            self._log_chat_interaction(user_id, message, error_msg, is_error=True)
            return error_msg
    
    def _log_chat_interaction(self, user_id: Optional[str], message: str, response: str, is_error: bool = False):
        """Log interaksi chat untuk monitoring"""
        try:
            from utils.logger import ai_logger
            
            masked_user_id = user_id or "anonymous"
            masked_message = message[:100] + "..." if len(message) > 100 else message
            masked_response = response[:100] + "..." if len(response) > 100 else response
            
            if is_error:
                ai_logger.logger.error(f"Chat Error - User: {masked_user_id}, Message: {masked_message}")
            else:
                ai_logger.logger.info(f"Chat Success - User: {masked_user_id}, Message: {masked_message}, Response: {masked_response}")
                
        except Exception as e:
            print(f"Error logging chat interaction: {str(e)}")
    
    def clear_conversation_history(self, user_id: str):
        """Membersihkan riwayat percakapan untuk user tertentu"""
        if user_id in self._conversation_histories:
            del self._conversation_histories[user_id]
    
    def get_conversation_history(self, user_id: str) -> List[Dict[str, str]]:
        """Mendapatkan riwayat percakapan untuk user tertentu"""
        return self._get_conversation_history(user_id)
    
    def _sanitize_input(self, text: str) -> str:
        """Sanitasi input text untuk keamanan"""
        if not text:
            return ""
        
        # Hapus karakter berbahaya
        import re
        # Hapus script tags
        text = re.sub(r'<script.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
        # Hapus HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # Hapus karakter kontrol
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
        # Batasi panjang
        if len(text) > 1000:
            text = text[:1000]
        
        return text.strip()
    
    def _sanitize_user_id(self, user_id: Optional[str]) -> Optional[str]:
        """Sanitasi user ID"""
        if not user_id:
            return None
        
        # Hapus karakter berbahaya
        import re
        user_id = re.sub(r'[^a-zA-Z0-9_-]', '', user_id)
        # Batasi panjang
        if len(user_id) > 50:
            user_id = user_id[:50]
        
        return user_id
    
    def _sanitize_book_id(self, book_id: Optional[str]) -> Optional[str]:
        """Sanitasi book ID"""
        if not book_id:
            return None
        
        # Hapus karakter berbahaya
        import re
        book_id = re.sub(r'[^a-zA-Z0-9_-]', '', book_id)
        # Batasi panjang
        if len(book_id) > 50:
            book_id = book_id[:50]
        
        return book_id
    
    def __del__(self):
        """Cleanup saat object dihapus"""
        if hasattr(self, 'client'):
            self.client.close() 