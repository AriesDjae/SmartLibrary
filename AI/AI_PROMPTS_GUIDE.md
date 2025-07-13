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
- Ahli dalam menganalisis preferensi membaca pengguna
- Mengenal berbagai genre buku dan penulis
- Dapat memberikan rekomendasi yang sesuai dengan mood dan kebutuhan
- Memahami konteks buku yang sedang dibaca atau diminati
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
2. **Analisis Preferensi**: Analisis preferensi pengguna berdasarkan konteks
3. **Rekomendasi Kontekstual**: Berikan rekomendasi yang sesuai dengan buku yang sedang dibaca
4. **Penjelasan Alasan**: Jelaskan mengapa buku tersebut direkomendasikan
5. **Saran Tambahan**: Berikan saran untuk eksplorasi genre atau penulis serupa
6. **Tone**: Gunakan bahasa Indonesia yang sopan, informatif, dan friendly
```

### Format Respons

```
## FORMAT RESPONS:
- Gunakan emoji yang relevan untuk membuat respons lebih menarik
- Berikan penjelasan singkat untuk setiap rekomendasi
- Akhiri dengan ajakan untuk bertanya lebih lanjut
```

### Contoh Respons yang Baik

```
## CONTOH RESPONS YANG BAIK:
"Hi! 👋 Senang bertemu dengan pecinta buku!

Berdasarkan preferensi Anda yang menyukai novel fiksi ilmiah, saya melihat Anda memiliki selera yang sophisticated. Novel-novel yang Anda sukai cenderung mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru.

Untuk buku yang sedang Anda baca, saya merekomendasikan beberapa novel yang serupa dalam hal tema dan gaya penulisan. Novel-novel ini juga mengeksplorasi teknologi masa depan dengan pendekatan yang unik.

Apakah Anda tertarik untuk mencoba genre lain yang masih dalam ranah fiksi ilmiah, atau ingin tetap fokus pada tema teknologi masa depan?"
```

## 🚫 Negative Prompt

### Tujuan

Negative prompt mencegah AI memberikan respons yang tidak diinginkan atau berkualitas rendah.

### Daftar Larangan

```
JANGAN:
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
```

### Implementasi

```python
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

## 📊 Contoh Respons yang Dihasilkan

### Respons untuk User Baru

```
Hi! 👋 Senang bertemu dengan pecinta buku!

Selamat datang di SmartLibrary! Saya adalah asisten AI yang akan membantu Anda menemukan buku-buku menarik sesuai dengan preferensi Anda.

Karena ini adalah pertama kali Anda menggunakan sistem ini, saya akan memberikan beberapa rekomendasi populer dari berbagai genre untuk memulai perjalanan membaca Anda.

📚 **REKOMENDASI BUKU UNTUK ANDA** 📚
==================================================

🎯 Berdasarkan Konten Serupa:
------------------------------
1. **Dune** oleh Frank Herbert
   📖 Genre: Fiksi Ilmiah
   💡 Mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru

2. **The Martian** oleh Andy Weir
   📖 Genre: Fiksi Ilmiah
   💡 Mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru

3. **Ready Player One** oleh Ernest Cline
   📖 Genre: Fiksi Ilmiah
   💡 Mengeksplorasi teknologi masa depan dan kemungkinan-kemungkinan baru

==================================================
💡 **Tips**: Setiap rekomendasi dipilih berdasarkan algoritma yang berbeda untuk memberikan variasi yang menarik!

Ada yang ingin Anda tanyakan lebih lanjut tentang rekomendasi buku?
```

### Respons untuk Preferensi Kompleks

```
Halo! 👋 Senang bertemu dengan pecinta buku yang memiliki selera yang sophisticated!

Saya melihat Anda menyukai novel yang menggabungkan fiksi ilmiah dengan elemen misteri dan memiliki karakter yang kuat. Ini adalah kombinasi yang sangat menarik! Anda cenderung menyukai cerita yang tidak hanya mengeksplorasi teknologi masa depan, tetapi juga memiliki plot yang kompleks dan karakter yang berkembang dengan baik.

Berdasarkan preferensi Anda, saya merekomendasikan beberapa novel yang menggabungkan elemen-elemen tersebut dengan cara yang unik.

📚 **REKOMENDASI BUKU UNTUK ANDA** 📚
==================================================

🤖 Berdasarkan AI:
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

Apakah Anda tertarik untuk mengeksplorasi genre lain yang masih dalam ranah fiksi ilmiah, atau ingin tetap fokus pada tema teknologi masa depan?
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

## 🚀 Best Practices

### 1. Konsistensi

- Gunakan format respons yang konsisten
- Pastikan semua respons mengikuti panduan yang sama
- Validasi setiap respons sebelum dikirim ke user

### 2. Personalisasi

- Gunakan konteks buku dan preferensi pengguna
- Berikan respons yang personal dan relevan
- Hindari respons generik

### 3. Engagement

- Selalu akhiri dengan ajakan untuk bertanya lebih lanjut
- Gunakan emoji yang relevan dan tidak berlebihan
- Berikan tips dan saran yang berguna

### 4. Keamanan

- Validasi semua input user
- Masking data sensitif dalam logs
- Rate limiting untuk mencegah abuse

### 5. Monitoring

- Monitor kualitas respons secara berkala
- Update prompt berdasarkan feedback user
- Test dengan berbagai jenis pertanyaan

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
