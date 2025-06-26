# SmartLibrary AI Services

Layanan AI untuk SmartLibrary yang menyediakan fitur chat AI, rekomendasi buku, dan analisis preferensi pengguna dengan struktur OOP yang terorganisir dan Flask API.

## 🚀 Fitur Utama

### 1. Chat AI (`/ai/chat`)

- Berinteraksi dengan AI untuk mendapatkan rekomendasi buku
- Mendukung konteks buku dan preferensi pengguna
- Riwayat percakapan per pengguna
- Integrasi dengan OpenAI GPT-4

### 2. Rekomendasi Buku

- **Content-based** (`/recommendations/content-based`): Berdasarkan konten buku menggunakan TF-IDF
- **Collaborative** (`/recommendations/collaborative`): Berdasarkan pengguna lain dengan collaborative filtering
- **AI-enhanced** (`/recommendations/ai-enhanced`): Ditingkatkan dengan OpenAI untuk analisis preferensi
- **Hybrid** (`/recommendations/hybrid`): Kombinasi semua metode untuk hasil terbaik

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

Jalankan script testing untuk memverifikasi semua endpoint:

```bash
python test_services.py
```

Atau test manual dengan curl:

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
