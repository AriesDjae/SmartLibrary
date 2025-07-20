import openai
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from .recommendation_service import RecommendationService
from .user_preference_service import UserPreferenceService
from collections import deque
from datetime import datetime, timedelta
from bson import ObjectId

# Load environment variables
load_dotenv()

class BookAIService:
    """Service class untuk menangani interaksi AI dengan buku"""
    
    def __init__(self):
        """Inisialisasi BookAI Service"""
        self._setup_openai()
        self._setup_database()
        self._setup_services()
        self._conversation_histories = {}  # Dictionary untuk menyimpan riwayat per user (deque)
    
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
            else:
                # Jika buku tidak ditemukan, kembalikan pesan khusus
                return "Buku yang Anda sebutkan belum ada di koleksi kami. Namun, berikut rekomendasi serupa berdasarkan preferensi Anda."
        except Exception as e:
            print(f"Error mendapatkan konteks buku: {str(e)}")
        return ""
    
    def _get_user_context(self, user_id: str) -> str:
        """Mendapatkan konteks preferensi pengguna dan histori pembacaan"""
        if not user_id:
            return ""
        
        try:
            # Dapatkan preferensi user
            preferences = self.user_preference_service.analyze_user_preferences(user_id)
            
            # Dapatkan histori pembacaan terbaru
            reading_history = self._get_user_reading_history(user_id)
            
            context = f"""
            Genre Favorit: {', '.join(preferences.get('preferred_genres', []))}
            Penulis Favorit: {', '.join(preferences.get('preferred_authors', []))}
            Topik Favorit: {', '.join(preferences.get('preferred_topics', []))}
            """
            
            if reading_history:
                context += f"\nHistori Pembacaan Terbaru:\n{reading_history}"
            
            return context
        except Exception as e:
            print(f"Error mendapatkan konteks user: {str(e)}")
        
        return ""
    
    def _get_user_reading_history(self, user_id: str) -> str:
        """Mendapatkan histori pembacaan user terbaru"""
        if not user_id or user_id == "anonymous":
            return "Belum ada aktivitas membaca yang tercatat."
        try:
            from utils.logger import ai_logger
            
            # Ambil data dari collection borrowings dan user_interactions
            db = self.db
            
            # Ambil buku yang dipinjam dalam 90 hari terakhir (bukan 30)
            ninety_days_ago = datetime.now() - timedelta(days=90)
            recent_borrowings = list(db.borrowings.find({
                "$or": [
                    {"user_id": user_id},
                    {"user_id": ObjectId(user_id)}
                ],
                "borrow_date": {"$gte": ninety_days_ago}
            }).sort("borrow_date", -1).limit(20))
            from utils.logger import ai_logger
            ai_logger.logger.info(f"DEBUG: Borrowings: {recent_borrowings}")
            # Ambil interaksi user terbaru (bookmark, read, review, rating)
            recent_interactions = list(db.user_interactions.find({
                "$or": [
                    {"user_id": user_id},
                    {"user_id": ObjectId(user_id)}
                ]
            }).sort("timestamp", -1).limit(20))
            ai_logger.logger.info(f"DEBUG: Interactions: {recent_interactions}")
            # Ambil rating user
            recent_ratings = list(db.ratings.find({
                "$or": [
                    {"user_id": user_id},
                    {"user_id": ObjectId(user_id)}
                ]
            }).sort("timestamp", -1).limit(20))
            ai_logger.logger.info(f"DEBUG: Ratings: {recent_ratings}")
            
            history_text = ""
            
            if recent_borrowings:
                history_text += "📚 Buku yang dipinjam akhir-akhir ini:\n"
                for borrowing in recent_borrowings:
                    book_id = borrowing.get("books_id") or borrowing.get("book_id")
                    if book_id:
                        book = db.books.find_one({"_id": book_id})
                        if book:
                            title = book.get("title", "N/A")
                            author = book.get("author", "N/A")
                            genre = book.get("genre", "N/A")
                            borrow_date = borrowing.get("borrow_date", "")
                            return_date = borrowing.get("return_date")
                            
                            status = "📖 Sedang dibaca" if not return_date else "✅ Selesai dibaca"
                            history_text += f"- {title} oleh {author} ({genre}) {status}\n"
                
                ai_logger.logger.info(f"Found {len(recent_borrowings)} recent borrowings for user {user_id}")
            
            if recent_interactions:
                history_text += "\n🎯 Aktivitas membaca terbaru:\n"
                for interaction in recent_interactions:
                    interaction_type = interaction.get("type", "")
                    book_id = interaction.get("book_id")
                    if book_id:
                        book = db.books.find_one({"_id": book_id})
                        if book:
                            title = book.get("title", "N/A")
                            progress = interaction.get("progress", 0)
                            # Map interaction type ke emoji dan deskripsi
                            type_mapping = {
                                "bookmark": "🔖 Bookmark",
                                "read": "📖 Membaca",
                                "review": "⭐ Review",
                                "rating": "⭐ Rating",
                                "like": "❤️ Suka",
                                "share": "📤 Bagikan",
                                "read_later": "⏳ Read Later"  # Tambahan
                            }
                            activity_desc = type_mapping.get(interaction_type, interaction_type)
                            if progress > 0:
                                activity_desc += f" ({progress}%)"
                            history_text += f"- {activity_desc}: {title}\n"
                
                ai_logger.logger.info(f"Found {len(recent_interactions)} recent interactions for user {user_id}")
            
            if recent_ratings:
                history_text += "\n⭐ Rating yang diberikan:\n"
                for rating in recent_ratings:
                    book_id = rating.get("book_id") or rating.get("books_id")
                    rating_value = rating.get("rating_value", 0)
                    if book_id:
                        book = db.books.find_one({"_id": book_id})
                        if book:
                            title = book.get("title", "N/A")
                            stars = "⭐" * int(rating_value)
                            history_text += f"- {title}: {stars} ({rating_value}/5)\n"
                
                ai_logger.logger.info(f"Found {len(recent_ratings)} recent ratings for user {user_id}")
            
            if not history_text:
                history_text = "Belum ada aktivitas membaca yang tercatat."
                ai_logger.logger.info(f"No reading history found for user {user_id}")
            
            return history_text
            
        except Exception as e:
            from utils.logger import ai_logger
            ai_logger.logger.error(f"Error getting reading history for user {user_id}: {str(e)}")
            return ""
    
    def _get_conversation_history(self, user_id: str) -> List[Dict[str, str]]:
        """Mendapatkan riwayat percakapan untuk user tertentu"""
        return list(self._conversation_histories.get(user_id, deque()))
    
    def _add_to_conversation_history(self, user_id: str, role: str, content: str):
        """Menambahkan pesan ke riwayat percakapan (max 10 pesan)"""
        if user_id not in self._conversation_histories:
            self._conversation_histories[user_id] = deque(maxlen=10)
        self._conversation_histories[user_id].append({
            "role": role,
            "content": content
        })
        
        # Batasi riwayat percakapan (maksimal 10 pesan)
        # if len(self._conversation_histories[user_id]) > 10:
        #     self._conversation_histories[user_id] = self._conversation_histories[user_id][-10:]
    
    def _create_system_prompt(self, book_context: str, user_context: str) -> str:
        """Membuat sistem prompt untuk OpenAI"""
        return f"""Anda adalah asisten perpustakaan cerdas bernama "SmartLib Assistant" yang dapat memberikan rekomendasi buku yang personal dan akurat.

## PERAN DAN KEMAMPUAN:
- Ahli dalam menganalisis preferensi membaca pengguna berdasarkan histori pembacaan
- Mengenal berbagai genre buku dan penulis
- Dapat memberikan rekomendasi yang sesuai dengan mood dan kebutuhan
- Memahami konteks buku yang sedang dibaca atau diminati
- Dapat mengakses dan menganalisis histori pembacaan pengguna
- Memberikan insight berdasarkan aktivitas membaca user (bookmark, rating, review)

## KONTEKS YANG TERSEDIA:
Konteks Buku:
{book_context}

Konteks Pengguna:
{user_context}

## PANDUAN RESPONS:
1. **Sambutan Personal**: Mulai dengan sambutan yang ramah dan personal berdasarkan histori user
2. **Analisis Aktivitas**: Analisis pola aktivitas user (genre favorit, rating tinggi, buku yang sedang dibaca)
3. **Insight Personal**: Berikan insight tentang preferensi membaca user berdasarkan data
4. **Konversasi Natural**: Lakukan tanya jawab natural sebelum memberikan rekomendasi
5. **Rekomendasi Kontekstual**: Berikan rekomendasi hanya ketika user meminta secara eksplisit
6. **Penjelasan Alasan**: Jelaskan mengapa buku tersebut direkomendasikan berdasarkan preferensi user
7. **Tone**: Gunakan bahasa Indonesia yang sopan, informatif, dan friendly

## STRATEGI KONVERSASI:
- Analisis histori pembacaan untuk memahami preferensi user
- Identifikasi genre favorit, penulis favorit, dan pola rating
- Jika user bertanya tentang aktivitas membaca, berikan analisis mendalam
- Berikan rekomendasi hanya ketika user mengatakan "berikan saya rekomendasi" atau kata-kata serupa
- Jaga agar conversation tidak terlalu panjang (maksimal 5-6 pertukaran)
- Gunakan data rating dan review untuk memberikan insight yang lebih akurat

## FORMAT RESPONS:
- Gunakan emoji yang relevan untuk membuat respons lebih menarik
- Berikan penjelasan singkat dan to the point
- Sertakan insight berdasarkan aktivitas user
- Akhiri dengan ajakan untuk bertanya lebih lanjut

## CONTOH RESPONS YANG BAIK:
Ketika user bertanya tentang buku yang dibaca akhir-akhir ini:
"Berdasarkan histori pembacaan Anda, saya melihat pola membaca yang sangat menarik! 📚

📖 Buku yang sedang Anda baca:
- "Dune" oleh Frank Herbert (Fiksi Ilmiah) - Sedang dibaca

⭐ Rating yang Anda berikan:
- "The Martian" oleh Andy Weir: ⭐⭐⭐⭐⭐ (5/5)
- "Ready Player One" oleh Ernest Cline: ⭐⭐⭐⭐ (4/5)

🎯 Aktivitas terbaru:
- 🔖 Bookmark: "Neuromancer" oleh William Gibson
- 📖 Membaca (75%): "Dune" oleh Frank Herbert

Saya melihat Anda sangat menyukai fiksi ilmiah dengan rating tinggi untuk buku teknologi masa depan. Anda juga cenderung memberikan rating tinggi untuk buku yang mengeksplorasi konsep futuristik. Apakah Anda ingin saya memberikan rekomendasi buku serupa berdasarkan preferensi ini?"

## HAL YANG TIDAK BOLEH DILAKUKAN:
- Jangan memberikan rekomendasi tanpa diminta secara eksplisit
- Jangan memberikan spoiler untuk buku yang belum dibaca
- Jangan memaksa rekomendasi yang tidak sesuai preferensi
- Jangan memberikan informasi yang tidak akurat tentang buku
- Jangan menggunakan bahasa yang terlalu formal atau kaku
- Jangan membuat conversation terlalu panjang
- Jangan mengabaikan data rating dan aktivitas user
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
            from utils.logger import ai_logger
            ai_logger.logger.info(f"DEBUG: user_id diterima di chat: {user_id}")
            # Validasi input
            if not message or not message.strip():
                return "Pesan tidak boleh kosong"
            if not user_id or user_id == "anonymous":
                return "Anda harus login untuk mendapatkan rekomendasi yang personal."
            
            # Sanitasi input
            message = self._sanitize_input(message)
            user_id = self._sanitize_id(user_id)
            book_id = self._sanitize_id(book_id)
            
            # Tambahkan pesan user ke riwayat
            self._add_to_conversation_history(user_id or "anonymous", "user", message)
            
            # Siapkan konteks
            book_context = self._get_book_context(book_id)
            user_context = self._get_user_context(user_id)
            
            # Deteksi jika buku tidak ditemukan
            book_not_found = False
            if book_id and (not book_context or "belum ada di koleksi kami" in book_context):
                book_not_found = True
            
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
            
            # Jika buku tidak ditemukan, tambahkan penjelasan di awal respons
            final_response = ai_response
            if book_not_found:
                final_response = (
                    "Maaf, buku yang Anda sebutkan belum ada di koleksi kami. Namun, berikut beberapa rekomendasi yang mungkin sesuai dengan preferensi Anda.\n\n"
                    + ai_response
                )
            
            # Deteksi apakah user meminta rekomendasi secara eksplisit
            recommendation_keywords = [
                'berikan saya rekomendasi', 'rekomendasi', 'sarankan', 'saran', 
                'rekomendasikan', 'bagaimana dengan', 'apa yang bagus', 'buku apa yang bagus',
                'tolong berikan', 'bisa berikan', 'mohon rekomendasi'
            ]
            
            user_wants_recommendations = any(
                keyword in message.lower() for keyword in recommendation_keywords
            )
            
            # Hanya tambahkan rekomendasi jika user meminta secara eksplisit
            if user_wants_recommendations:
                # Coba content-based terlebih dahulu jika ada book_id
                recs = []
                if book_id and not book_not_found:
                    try:
                        recs = self.recommendation_service.get_content_based_recommendations(book_id, 3)
                        if recs:
                            from utils.logger import ai_logger
                            ai_logger.logger.info(f"Content-based recommendations generated: {len(recs)}")
                    except Exception as e:
                        from utils.logger import ai_logger
                        ai_logger.logger.warning(f"Content-based failed: {str(e)}")
                if not recs and user_id:
                    try:
                        recs = self.recommendation_service.get_collaborative_recommendations(user_id, 3)
                        if recs:
                            from utils.logger import ai_logger
                            ai_logger.logger.info(f"Collaborative recommendations generated: {len(recs)}")
                    except Exception as e:
                        from utils.logger import ai_logger
                        ai_logger.logger.warning(f"Collaborative failed: {str(e)}")
                if not recs:
                    try:
                        recs = self.recommendation_service.get_ai_enhanced_recommendations(message, 3)
                        if recs:
                            from utils.logger import ai_logger
                            ai_logger.logger.info(f"AI-enhanced recommendations generated: {len(recs)}")
                    except Exception as e:
                        from utils.logger import ai_logger
                        ai_logger.logger.warning(f"AI-enhanced failed: {str(e)}")
                # Hilangkan duplikasi buku berdasarkan book_id
                seen_ids = set()
                unique_recs = []
                for rec in recs:
                    rec_id = rec.get('book_id') or rec.get('_id')
                    if rec_id and rec_id not in seen_ids:
                        unique_recs.append(rec)
                        seen_ids.add(rec_id)
                # Format rekomendasi profesional & hemat token
                if unique_recs:
                    # Ambil maksimal 3 buku
                    unique_recs = unique_recs[:3]
                    genre_user = None
                    try:
                        preferences = self.user_preference_service.analyze_user_preferences(user_id) if user_id else {}
                        genre_user = preferences.get('preferred_genres', [None])[0]
                    except:
                        genre_user = None
                    genre_text = f" pada genre {genre_user}" if genre_user else ""
                    final_response += f"\n\nBerikut rekomendasi buku terbaik{genre_text} untuk Anda:\n"
                    emoji_map = {
                        "Fantasi": "🧙‍♂️",
                        "Fiksi Ilmiah": "🚀",
                        "Petualangan": "🌍",
                        "Misteri": "🕵️",
                        "Romansa": "💖",
                        "Sejarah": "🏺",
                        "Biografi": "👤",
                        "Self-Help": "🌱",
                        "Teknologi": "💻",
                        "Filsafat": "🧠",
                    }
                    for i, rec in enumerate(unique_recs, 1):
                        title = rec.get('title', 'N/A')
                        author = rec.get('author', 'N/A')
                        genre = rec.get('genre', 'N/A')
                        emoji = emoji_map.get(genre, "📚")
                        highlight = self._get_genre_description(genre)
                        final_response += f"{i}. {emoji} {title} — {author} [{genre}]\n   {highlight}\n"
                    final_response += "\nIngin info detail atau genre lain? Tanyakan saja."
                else:
                    final_response += "\n\nMaaf, belum ada data bacaan yang cukup untuk memberikan rekomendasi yang personal. Silakan baca dan beri rating beberapa buku terlebih dahulu."
            
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
    
    def _sanitize_id(self, id_value: Optional[str]) -> Optional[str]:
        """Sanitasi dan validasi ID (user_id/book_id)"""
        if not id_value:
            return None
        id_value = str(id_value).strip()
        return id_value[:50] if id_value else None
    
    def _sanitize_user_id(self, user_id: Optional[str]) -> Optional[str]:
        """Sanitasi user ID (deprecated, gunakan _sanitize_id)"""
        return self._sanitize_id(user_id)

    def _sanitize_book_id(self, book_id: Optional[str]) -> Optional[str]:
        """Sanitasi book ID (deprecated, gunakan _sanitize_id)"""
        return self._sanitize_id(book_id)
    
    def __del__(self):
        """Cleanup saat object dihapus"""
        if hasattr(self, 'client'):
            self.client.close() 