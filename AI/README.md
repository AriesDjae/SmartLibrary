# SmartLibrary AI Services

Layanan AI untuk SmartLibrary yang menyediakan fitur chat AI, rekomendasi buku, dan analisis preferensi pengguna dengan struktur OOP yang terorganisir dan Flask API.

## 🚀 Fitur Utama

### 1. Chat AI (`/ai/chat`)

- Berinteraksi dengan AI untuk mendapatkan rekomendasi buku
- Mendukung konteks buku dan preferensi pengguna
- Riwayat percakapan per pengguna
- Integrasi dengan OpenAI GPT-4
- **Sistem Prompt**: Prompt terstruktur dengan panduan respons yang jelas
- **Negative Prompt**: Mencegah respons yang tidak diinginkan
- **Post-Processing**: Validasi dan perbaikan respons otomatis
- **Keamanan**: Input sanitization dan rate limiting

### 2. Rekomendasi Buku

- **Content-based** (`/recommendations/content-based`): Berdasarkan konten buku menggunakan TF-IDF
- **Collaborative** (`/recommendations/collaborative`): Berdasarkan pengguna lain dengan collaborative filtering
- **AI-enhanced** (`/recommendations/ai-enhanced`): Ditingkatkan dengan OpenAI untuk analisis preferensi
- **Hybrid** (`/recommendations/hybrid`): Kombinasi semua metode untuk hasil terbaik
- **Keamanan**: Scoring internal tidak bocor ke pengguna

### 3. Teknik Scoring yang Diterapkan

#### 📊 Content-Based Filtering

- **TF-IDF Vectorization**: Mengubah teks buku menjadi vektor numerik
- **Cosine Similarity**: Menghitung kemiripan antar buku (0-1)
- **Feature Engineering**: Title + Description + Author + Genre
- **Scoring**: Similarity score berdasarkan kemiripan konten

#### 👥 Collaborative Filtering

- **User-Item Matrix**: Matriks rating pengguna vs buku
- **User Similarity**: Cosine similarity antar pengguna
- **Rating Prediction**: Weighted average rating dari user serupa
- **Scoring**: Predicted rating (1-5) berdasarkan preferensi user lain

#### 🤖 AI-Enhanced Filtering

- **OpenAI GPT-4**: Ekstraksi kata kunci dari preferensi user
- **Semantic Search**: Pencarian berdasarkan makna, bukan kata
- **Keyword Matching**: TF-IDF dengan kata kunci yang diekstrak AI
- **Scoring**: Relevance score berdasarkan kecocokan semantik

#### 🎯 Hybrid Recommendation

- **Ensemble Method**: Kombinasi 3 teknik scoring
- **Fallback Strategy**: Jika satu metode gagal, gunakan yang lain
- **Performance Optimization**: Parallel processing untuk kecepatan
- **Scoring**: Internal scoring untuk developer, clean response untuk user

### 3. Analisis Preferensi Pengguna

- **User Preferences** (`/user/preferences`): Analisis mendalam preferensi pengguna
- **Similar Users** (`/user/similar-users`): Mencari pengguna dengan preferensi serupa
- **Reading Statistics**: Statistik membaca pengguna

## 📁 Struktur Proyek

```
AI/
├── app.py                          # Flask application utama
├── run.py                          # Script untuk menjalankan aplikasi
├── requirements.txt                # Dependensi Python
├── README.md                       # Dokumentasi ini
├── env.example                     # Template environment variables
├── start.sh                        # Script startup untuk Linux/Mac
├── start.bat                       # Script startup untuk Windows
├── test_services.py                # Script testing
├── integration_example.js          # Contoh integrasi backend
├── config/
│   ├── __init__.py
│   └── settings.py                # Konfigurasi aplikasi
├── services/
│   ├── __init__.py
│   ├── book_ai_service.py         # Service untuk chat AI
│   ├── recommendation_service.py  # Service untuk rekomendasi
│   └── user_preference_service.py # Service untuk analisis preferensi
└── utils/
    ├── __init__.py
    ├── database.py                # Utility database (Singleton pattern)
    └── logger.py                  # Utility logging
```

## 🛠️ Instalasi & Setup

### Metode 1: Menggunakan Script Otomatis (Direkomendasikan)

#### Linux/Mac:

```bash
cd AI
chmod +x start.sh
./start.sh
```

#### Windows:

```bash
cd AI
start.bat
```

### Metode 2: Manual Setup

1. **Clone repository dan masuk ke direktori AI**

```bash
cd AI
```

2. **Buat virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate     # Windows
```

3. **Install dependensi**

```bash
pip install -r requirements.txt
```

4. **Buat file .env dari template**

```bash
cp env.example .env
```

5. **Edit file .env dengan konfigurasi Anda**

```bash
# Database
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=smartlibrary

# OpenAI (Wajib untuk fitur AI-enhanced)
OPENAI_API_KEY=your_openai_api_key_here

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
AI_SERVICE_PORT=5001
AI_SERVICE_HOST=0.0.0.0
```

6. **Jalankan aplikasi**

```bash
python run.py
```

## 🧪 Testing

### Test AI Services

Jalankan script testing untuk memverifikasi semua endpoint:

```bash
python test_services.py
```

### Test AI Prompts

Test kualitas respons AI dan sistem prompt:

```bash
python test_ai_prompts.py
```

### Test Manual dengan curl:

```bash
# Health check
curl http://localhost:5001/health

# Chat AI
curl -X POST http://localhost:5001/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Saya suka novel fiksi ilmiah", "user_id": "test_user"}'

# Hybrid recommendations
curl -X POST http://localhost:5001/recommendations/hybrid \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "user_preferences": "Saya suka novel fiksi ilmiah"}'
```

## 📊 Monitoring Scoring Hybrid

### Melihat Log Scoring Hybrid

Untuk melihat detail scoring dari sistem hybrid recommendation:

```bash
cd AI/tools
python view_hybrid_scoring_logs.py
```

Script ini akan menampilkan:

- **Detail scoring** dari setiap metode (Content-Based, Collaborative, AI-Enhanced)
- **Performance metrics** (waktu eksekusi setiap metode)
- **Scoring patterns** (distribusi score, rating, relevance)
- **Statistik penggunaan** setiap metode

### Contoh Output Log Scoring:

```
🔍 HYBRID RECOMMENDATION REQUEST
   User ID: user123
   Book ID: book456
   User Preferences: Saya suka novel fiksi ilmiah
   N Recommendations: 5

📊 CONTENT-BASED: Processing book_id=book456
   📖 Found book at index 15
   🔢 Calculated 100 similarity scores
   📈 Score range: 0.0000 - 0.8500
   🎯 Selected top 5 similar books
      1. Novel Fiksi Ilmiah A - Score: 0.8500
      2. Novel Fiksi Ilmiah B - Score: 0.7200
      3. Novel Fiksi Ilmiah C - Score: 0.6800
   ✅ Content-Based: Generated 5 recommendations in 0.150s

👥 COLLABORATIVE: Processing user_id=user123
   👤 Found user in matrix with 50 books
   🔢 Calculated similarities with 25 users
   📈 Similarity range: 0.0000 - 0.9200
   🎯 Selected top 5 similar users
      1. User 12 - Similarity: 0.9200
      2. User 8 - Similarity: 0.8500
   📚 User has read 15 books, 35 unread books available
   🧮 Calculated predictions for 35 unread books
      1. Novel Rekomendasi A - Predicted Rating: 4.50
      2. Novel Rekomendasi B - Predicted Rating: 4.20
   ✅ Collaborative: Generated 5 recommendations in 0.200s

🤖 AI-ENHANCED: Processing user preferences
   📝 User Preferences: Saya suka novel fiksi ilmiah
   🧠 Calling OpenAI API for keyword extraction...
   🔑 Extracted keywords: fiksi, ilmiah, novel, teknologi, masa depan
   🔍 Search query: fiksi ilmiah novel teknologi masa depan
   🔢 Calculated 100 relevance scores
   📈 Relevance range: 0.0000 - 0.9500
   🎯 Selected top 5 relevant books
      1. Novel AI Terbaik - Relevance: 0.9500
         Keywords: fiksi, ilmiah, novel, teknologi, masa depan
      2. Novel Teknologi Masa Depan - Relevance: 0.8800
         Keywords: fiksi, ilmiah, novel, teknologi, masa depan
   ✅ AI-Enhanced: Generated 5 recommendations in 2.500s

🎯 HYBRID RECOMMENDATION SUMMARY
   Total Recommendations: 15
   Content-Based: 5
   Collaborative: 5
   AI-Enhanced: 5
   Total Time: 2.850s
```

### Fitur Log Viewer:

1. **📋 Lihat Semua Log Hybrid** - Tampilkan semua request hybrid
2. **📊 Lihat Log Content-Based** - Filter hanya content-based
3. **👥 Lihat Log Collaborative** - Filter hanya collaborative
4. **🤖 Lihat Log AI-Enhanced** - Filter hanya AI-enhanced
5. **⏱️ Analisis Performance** - Analisis waktu eksekusi
6. **🎯 Analisis Scoring Patterns** - Analisis distribusi scoring
7. **📈 Statistik Log** - Statistik penggunaan metode

## 📡 API Endpoints

### Health Check

```
GET /health
Response: {"status": "healthy", "message": "AI Services are running"}
```

### Chat AI

```
POST /ai/chat
Body: {
    "message": "Saya suka novel fiksi ilmiah",
    "user_id": "user123",
    "book_id": "book456" (optional)
}
Response: {"response": "AI response with recommendations"}

POST /ai/chat/clear
Body: {"user_id": "user123"}
Response: {"message": "Chat history cleared successfully"}
```

### Rekomendasi

```
POST /recommendations/content-based
Body: {
    "book_id": "book456",
    "n_recommendations": 5
}

POST /recommendations/collaborative
Body: {
    "user_id": "user123",
    "n_recommendations": 5
}

POST /recommendations/ai-enhanced
Body: {
    "user_preferences": "Saya suka novel fiksi ilmiah",
    "n_recommendations": 5
}

POST /recommendations/hybrid
Body: {
    "user_id": "user123",
    "book_id": "book456",
    "user_preferences": "Saya suka novel fiksi ilmiah",
    "n_recommendations": 5
}
```

### User Preferences

```
GET /user/preferences?user_id=user123

GET /user/similar-users?user_id=user123&n_similar_users=5
```

## 🔗 Integrasi dengan Backend

### Tambahkan ke Backend Node.js:

```javascript
// Tambahkan file integration_example.js ke backend Anda
const { setupAIRoutes } = require("./integration_example");

// Setup routes di app.js atau server.js
setupAIRoutes(app);
```

### Atau gunakan fetch manual:

```javascript
const AI_SERVICE_URL = "http://localhost:5001";

// Chat dengan AI
const chatResponse = await fetch(`${AI_SERVICE_URL}/ai/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Saya suka novel fiksi ilmiah",
    user_id: "user123",
  }),
});

// Rekomendasi hybrid
const recResponse = await fetch(`${AI_SERVICE_URL}/recommendations/hybrid`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: "user123",
    user_preferences: "Saya suka novel fiksi ilmiah",
  }),
});
```

## 🏗️ Arsitektur

### Design Patterns yang Digunakan:

1. **Singleton Pattern**: DatabaseConnection untuk koneksi database
2. **Service Layer Pattern**: Pemisahan logika bisnis ke service classes
3. **Factory Pattern**: Konfigurasi berdasarkan environment
4. **Repository Pattern**: DatabaseManager untuk operasi database

### Komponen Utama:

- **BookAIService**: Menangani chat AI dan integrasi OpenAI
- **RecommendationService**: Algoritma rekomendasi (Content-based, Collaborative, AI-enhanced)
- **UserPreferenceService**: Analisis preferensi pengguna
- **DatabaseManager**: Operasi database yang umum
- **Logger**: Sistem logging terstruktur

### Sistem Prompt AI:

#### 📝 Sistem Prompt Terstruktur:

- **Peran dan Kemampuan**: Mendefinisikan peran AI sebagai asisten perpustakaan
- **Konteks**: Menggunakan informasi buku dan preferensi pengguna
- **Panduan Respons**: 6 langkah untuk respons yang konsisten
- **Format**: Penggunaan emoji dan struktur yang menarik
- **Contoh**: Template respons yang baik untuk referensi

#### 🚫 Negative Prompt:

- **Mencegah Spoiler**: Tidak memberikan spoiler buku
- **Bahasa yang Tepat**: Menghindari bahasa formal/kaku
- **Kualitas Respons**: Mencegah respons pendek/generik
- **Keamanan**: Menghindari bahasa tidak sopan
- **Konsistensi**: Memastikan respons dalam bahasa Indonesia

#### 🔧 Post-Processing:

- **Validasi Bahasa**: Memastikan respons dalam bahasa Indonesia
- **Panjang Respons**: Membatasi panjang respons optimal
- **Engagement**: Memastikan ada ajakan untuk bertanya lebih lanjut
- **Error Handling**: Fallback respons jika terjadi error

## 🔧 Konfigurasi

### Environment Variables:

| Variable             | Default                     | Description            |
| -------------------- | --------------------------- | ---------------------- |
| `MONGODB_URI`        | `mongodb://localhost:27017` | URI MongoDB            |
| `DATABASE_NAME`      | `smartlibrary`              | Nama database          |
| `OPENAI_API_KEY`     | -                           | API Key OpenAI (wajib) |
| `FLASK_ENV`          | `development`               | Environment Flask      |
| `AI_SERVICE_PORT`    | `5001`                      | Port aplikasi          |
| `TFIDF_MAX_FEATURES` | `5000`                      | Max features TF-IDF    |
| `LOG_LEVEL`          | `INFO`                      | Level logging          |

## 📊 Monitoring & Logging

- Logs disimpan di `logs/ai_services_YYYYMMDD.log`
- Health check endpoint: `GET /health`
- Performance metrics di-log otomatis
- Error handling terstruktur

## 🚀 Deployment

### Development:

```bash
python run.py
```

### Production:

```bash
# Pastikan MongoDB berjalan
# Edit .env untuk production settings
python run.py
```

## 🐛 Troubleshooting

### Masalah Umum:

1. **MongoDB Connection Error**

   ```bash
   # Pastikan MongoDB berjalan
   sudo systemctl start mongod
   # Atau gunakan MongoDB Atlas
   # Update MONGODB_URI di .env
   ```

2. **OpenAI API Error**

   ```bash
   # Periksa API key di .env
   echo $OPENAI_API_KEY
   # Test dengan curl
   curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
   ```

3. **Import Error**

   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

4. **Port Already in Use**
   ```bash
   # Cek port yang digunakan
   lsof -i :5001
   # Atau ganti port di .env
   AI_SERVICE_PORT=5002
   ```

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'Add nama fitur'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

## 📝 License

MIT License - lihat file LICENSE untuk detail.

## 🆘 Support

Jika mengalami masalah:

1. Cek troubleshooting section
2. Jalankan `python test_services.py`
3. Periksa logs di `logs/`
4. Buat issue di repository
