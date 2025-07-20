# 🤖 AI Prompts Guide - SmartLibrary

Dokumen ini menjelaskan sistem prompt dan negative prompt yang digunakan dalam SmartLibrary AI Services untuk memastikan respons yang berkualitas tinggi dan konsisten.

## 📋 Overview

SmartLibrary AI menggunakan sistem prompt yang terstruktur dengan 3 komponen utama:

1. **Sistem Prompt Terstruktur** - Mendefinisikan peran dan panduan respons
2. **Negative Prompt** - Mencegah respons yang tidak diinginkan
3. **Post-Processing** - Validasi dan perbaikan respons otomatis

## 🎯 Sistem Prompt Terstruktur

### Peran dan Kemampuan

```
Anda adalah asisten perpustakaan cerdas bernama "SmartLib Assistant" yang dapat memberikan rekomendasi buku yang personal dan akurat.

## PERAN DAN KEMAMPUAN:
- Ahli dalam menganalisis preferensi membaca pengguna berdasarkan histori pembacaan
- Mengenal berbagai genre buku dan penulis
- Dapat memberikan rekomendasi yang sesuai dengan mood dan kebutuhan
- Memahami konteks buku yang sedang dibaca atau diminati
- Dapat mengakses dan menganalisis histori pembacaan pengguna
```

### Konteks yang Tersedia

```
## KONTEKS YANG TERSEDIA:
Konteks Buku:
{book_context}

Konteks Pengguna:
{user_context}
```

### Panduan Respons (6 Langkah)

```
## PANDUAN RESPONS:
1. **Sambutan Personal**: Mulai dengan sambutan yang ramah dan personal
2. **Analisis Histori**: Jika user bertanya tentang buku yang dibaca akhir-akhir ini, analisis histori pembacaan mereka
3. **Konversasi Natural**: Lakukan tanya jawab natural sebelum memberikan rekomendasi
4. **Rekomendasi Kontekstual**: Berikan rekomendasi hanya ketika user meminta secara eksplisit
5. **Penjelasan Alasan**: Jelaskan mengapa buku tersebut direkomendasikan
6. **Tone**: Gunakan bahasa Indonesia yang sopan, informatif, dan friendly
```

### Strategi Konversasi

```
## STRATEGI KONVERSASI:
- Jangan langsung memberikan rekomendasi tanpa konteks yang cukup
- Tanyakan preferensi genre, mood, atau kebutuhan spesifik user
- Jika user bertanya "saya suka membaca buku apa akhir-akhir ini?", analisis histori mereka
- Berikan rekomendasi hanya ketika user mengatakan "berikan saya rekomendasi" atau kata-kata serupa
- Jaga agar conversation tidak terlalu panjang (maksimal 5-6 pertukaran)
```

### Format Respons

```
## FORMAT RESPONS:
- Gunakan emoji yang relevan untuk membuat respons lebih menarik
- Berikan penjelasan singkat dan to the point
- Akhiri dengan ajakan untuk bertanya lebih lanjut
```

### Contoh Respons yang Baik

```
## CONTOH RESPONS YANG BAIK:
Ketika user bertanya tentang buku yang dibaca akhir-akhir ini:
"Berdasarkan histori pembacaan Anda, saya melihat Anda baru-baru ini membaca beberapa buku menarik! 📚

Anda telah membaca:
- "Dune" oleh Frank Herbert (Fiksi Ilmiah)
- "The Martian" oleh Andy Weir (Fiksi Ilmiah)
- "Ready Player One" oleh Ernest Cline (Fiksi Ilmiah)

Saya melihat Anda sangat menyukai genre fiksi ilmiah dengan tema teknologi masa depan. Apakah Anda ingin saya memberikan rekomendasi buku serupa, atau ada genre lain yang ingin Anda eksplorasi?"
```

## 🚫 Negative Prompt

### Tujuan

Negative prompt mencegah AI memberikan respons yang tidak diinginkan atau berkualitas rendah.

### Daftar Larangan

```
JANGAN:
- Berikan rekomendasi tanpa diminta secara eksplisit
- Berikan spoiler untuk buku yang belum dibaca
- Gunakan bahasa yang terlalu formal atau kaku
- Berikan rekomendasi yang tidak sesuai dengan preferensi pengguna
- Berikan informasi yang tidak akurat tentang buku
- Gunakan bahasa yang tidak sopan atau tidak profesional
- Berikan respons yang terlalu pendek atau tidak informatif
- Mengabaikan konteks buku atau preferensi pengguna
- Berikan rekomendasi yang terlalu generik tanpa penjelasan
- Gunakan emoji yang tidak relevan atau berlebihan
- Berikan respons yang tidak dalam bahasa Indonesia
- Membuat conversation terlalu panjang
```

## 🔧 Post-Processing

### Validasi Bahasa Indonesia

```python
def _is_indonesian_text(self, text: str) -> bool:
    """Cek apakah teks dalam bahasa Indonesia"""
    indonesian_words = [
        'yang', 'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'oleh',
        'buku', 'novel', 'cerita', 'penulis', 'genre', 'rekomendasi', 'suka', 'bagus',
        'menarik', 'baik', 'jika', 'karena', 'seperti', 'juga', 'dapat', 'akan', 'sudah'
    ]

    text_lower = text.lower()
    indonesian_count = sum(1 for word in indonesian_words if word in text_lower)

    return indonesian_count >= 3
```

### Validasi Panjang Respons

```python
# Batasi panjang respons
if len(response) > 1000:
    response = response[:1000] + "..."
```

### Validasi Engagement

```python
# Pastikan respons diakhiri dengan ajakan untuk bertanya lebih lanjut
if not any(phrase in response.lower() for phrase in ['bertanya', 'tanya', 'lanjut', 'lain', '?']):
    response += "\n\nAda yang ingin Anda tanyakan lebih lanjut tentang rekomendasi buku?"
```

## 🆕 Fitur Baru: Kontrol Rekomendasi

### Deteksi Permintaan Rekomendasi

Sistem AI sekarang dapat mendeteksi kapan user meminta rekomendasi secara eksplisit:

```python
recommendation_keywords = [
    'berikan saya rekomendasi', 'rekomendasi', 'sarankan', 'saran',
    'rekomendasikan', 'bagaimana dengan', 'apa yang bagus', 'buku apa yang bagus',
    'tolong berikan', 'bisa berikan', 'mohon rekomendasi'
]

user_wants_recommendations = any(
    keyword in message.lower() for keyword in recommendation_keywords
)
```

### Akses Histori Pembacaan

AI sekarang dapat mengakses dan menganalisis histori pembacaan user:

```python
def _get_user_reading_history(self, user_id: str) -> str:
    """Mendapatkan histori pembacaan user terbaru"""
    # Ambil buku yang dipinjam dalam 30 hari terakhir
    # Ambil interaksi user terbaru
    # Format histori untuk AI
```

### Kontrol UI Rekomendasi

Frontend sekarang memiliki kontrol untuk menampilkan/menyembunyikan rekomendasi:

```typescript
const [showRecommendations, setShowRecommendations] = useState(false);

// Tampilkan rekomendasi hanya ketika user meminta
if (userWantsRecommendations) {
  setShowRecommendations(true);
}
```

## 📊 Contoh Respons yang Dihasilkan

### Respons untuk Pertanyaan Histori

```
Berdasarkan histori pembacaan Anda, saya melihat Anda baru-baru ini membaca beberapa buku menarik! 📚

Anda telah membaca:
- "Dune" oleh Frank Herbert (Fiksi Ilmiah) (dipinjam: 2024-01-15)
- "The Martian" oleh Andy Weir (Fiksi Ilmiah) (dipinjam: 2024-01-10)
- "Ready Player One" oleh Ernest Cline (Fiksi Ilmiah) (dipinjam: 2024-01-05)

Aktivitas membaca terbaru:
- bookmark: Dune
- read: The Martian
- review: Ready Player One

Saya melihat Anda sangat menyukai genre fiksi ilmiah dengan tema teknologi masa depan. Apakah Anda ingin saya memberikan rekomendasi buku serupa, atau ada genre lain yang ingin Anda eksplorasi?
```

### Respons untuk Permintaan Rekomendasi

```
Tentu! Berdasarkan preferensi Anda yang menyukai fiksi ilmiah, saya merekomendasikan beberapa buku yang serupa dengan yang Anda baca sebelumnya.

📚 **REKOMENDASI BUKU UNTUK ANDA** 📚
==================================================

🎯 Berdasarkan Konten Serupa:
------------------------------
1. **The Three-Body Problem** oleh Liu Cixin
   📖 Genre: Fiksi Ilmiah
   💡 Mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru

2. **Neuromancer** oleh William Gibson
   📖 Genre: Fiksi Ilmiah
   💡 Mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru

3. **Snow Crash** oleh Neal Stephenson
   📖 Genre: Fiksi Ilmiah
   💡 Mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru

==================================================
💡 **Tips**: Setiap rekomendasi dipilih berdasarkan algoritma yang berbeda untuk memberikan variasi yang menarik!

Ada yang ingin Anda tanyakan lebih lanjut tentang rekomendasi buku?
```

## 🧪 Testing Prompts

### Test Kualitas Respons

```bash
python test_ai_prompts.py
```

### Metrik Kualitas

- **Panjang Respons**: 100-1000 karakter (10 points)
- **Bahasa Indonesia**: Minimal 5 kata Indonesia (20 points)
- **Expected Elements**: Elemen yang diharapkan dalam respons (40 points)
- **Emoji Usage**: 2-10 emoji yang relevan (10 points)
- **Struktur Respons**: Rekomendasi dan engagement (20 points)

### Test Scenarios

1. **User Baru (Cold Start)**
2. **User dengan Preferensi Kompleks**
3. **User yang Bingung**
4. **User yang Spesifik**
5. **User yang Meminta Histori**
6. **User yang Meminta Rekomendasi**

## 🔄 Monitoring dan Improvement

### Logging

```python
def _log_chat_interaction(self, user_id: Optional[str], message: str, response: str, is_error: bool = False):
    """Log interaksi chat untuk monitoring"""
    masked_user_id = user_id or "anonymous"
    masked_message = message[:100] + "..." if len(message) > 100 else message
    masked_response = response[:100] + "..." if len(response) > 100 else response

    if is_error:
        ai_logger.logger.error(f"Chat Error - User: {masked_user_id}, Message: {masked_message}")
    else:
        ai_logger.logger.info(f"Chat Success - User: {masked_user_id}, Message: {masked_message}, Response: {masked_response}")
```

### Metrics yang Dimonitor

- **Response Quality Score**: Skor kualitas respons (0-100)
- **Negative Prompt Compliance**: Kepatuhan terhadap negative prompt
- **Response Time**: Waktu respons AI
- **User Engagement**: Apakah user melanjutkan percakapan
- **Error Rate**: Tingkat error dalam respons
- **Recommendation Request Rate**: Tingkat permintaan rekomendasi
- **Histori Access Rate**: Tingkat akses histori pembacaan

## 🚀 Best Practices

### 1. Konsistensi

- Gunakan format respons yang konsisten
- Pastikan semua respons mengikuti panduan yang sama
- Validasi setiap respons sebelum dikirim ke user

### 2. Personalisasi

- Gunakan konteks buku dan preferensi pengguna
- Akses histori pembacaan untuk analisis yang lebih akurat
- Berikan respons yang personal dan relevan
- Hindari respons generik

### 3. Engagement

- Selalu akhiri dengan ajakan untuk bertanya lebih lanjut
- Gunakan emoji yang relevan dan tidak berlebihan
- Berikan tips dan saran yang berguna
- Jaga agar conversation tidak terlalu panjang

### 4. Kontrol Rekomendasi

- Berikan rekomendasi hanya ketika diminta secara eksplisit
- Deteksi kata kunci permintaan rekomendasi
- Tampilkan komponen rekomendasi secara otomatis
- Berikan kontrol kepada user untuk menampilkan/menyembunyikan

### 5. Keamanan

- Validasi semua input user
- Masking data sensitif dalam logs
- Rate limiting untuk mencegah abuse
- Akses histori pembacaan dengan aman

### 6. Monitoring

- Monitor kualitas respons secara berkala
- Update prompt berdasarkan feedback user
- Test dengan berbagai jenis pertanyaan
- Monitor penggunaan fitur histori dan rekomendasi

## 📈 Continuous Improvement

### Feedback Loop

1. **Collect Feedback**: Kumpulkan feedback dari user
2. **Analyze Patterns**: Analisis pola respons yang baik/buruk
3. **Update Prompts**: Update sistem prompt berdasarkan analisis
4. **Test Changes**: Test perubahan dengan berbagai skenario
5. **Deploy**: Deploy perubahan ke production
6. **Monitor**: Monitor dampak perubahan

### A/B Testing

- Test berbagai versi prompt
- Bandingkan kualitas respons
- Pilih versi yang memberikan hasil terbaik

---

**Catatan**: Dokumen ini harus direview dan diupdate secara berkala untuk memastikan sistem prompt tetap optimal dan sesuai dengan kebutuhan user.
