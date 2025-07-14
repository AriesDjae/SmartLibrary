# 📚 SmartLibrary Backend

## 📁 Struktur Folder Backend

```
BackEnd/
├── config/           # Pengaturan koneksi database
│   └── db.js
├── controllers/      # Pengatur logika bisnis & respon API
│   ├── authController.js
│   ├── bookController.js
│   ├── borrowingController.js
│   ├── genreController.js
│   ├── userController.js
│   └── userInteractionController.js
├── middleware/       # Fungsi perantara (misal: cek login)
│   └── auth.js
├── models/           # Aturan & operasi data (database)
│   ├── authModel.js
│   ├── bookModel.js
│   ├── borrowingModel.js
│   ├── genreModel.js
│   └── userInteractionModel.js
├── routes/           # Jalur/jembatan API
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── borrowingRoutes.js
│   ├── genreRoutes.js
│   ├── userInteractionRoutes.js
│   └── userRoutes.js
├── server.js         # Pintu utama backend (menyalakan server)
├── package.json      # Daftar dependensi & script
└── ...
```

---

## 🧩 Penjelasan Tiap Folder & File

### 1. **config/**
- **db.js**: Cara backend terhubung ke database MongoDB.

### 2. **controllers/**
- Tempat logika utama aplikasi. Menerima permintaan dari route, memproses, lalu mengirim respon.
- Contoh: `bookController.js` mengatur permintaan tentang buku.

### 3. **middleware/**
- Fungsi perantara, misal: cek apakah user sudah login sebelum akses fitur tertentu.

### 4. **models/**
- Aturan bentuk data (schema) dan operasi database (CRUD: Create, Read, Update, Delete).
- Contoh: `bookModel.js` mengatur data buku.

### 5. **routes/**
- Jalur API. Menyambungkan URL (misal `/books`) ke controller yang sesuai.

### 6. **server.js**
- File utama untuk menyalakan server backend.

---

## 🔗 Cara Kerja Backend (Alur Sederhana)

1. **User/Aplikasi** mengirim permintaan ke backend (misal: "Tampilkan semua buku!").
2. **Route** menerima permintaan dan meneruskannya ke controller.
3. **Controller** memproses permintaan, tanya ke model jika perlu data.
4. **Model** mengambil/menyimpan data di database.
5. **Controller** mengirim jawaban ke user/aplikasi.

---

## 🛣️ Daftar Lengkap API Endpoint

| Endpoint                              | Method | Fungsi                                      |
|---------------------------------------|--------|---------------------------------------------|
| `/api/books`                          | GET    | Lihat semua buku                            |
| `/api/books/:id`                      | GET    | Lihat detail buku berdasarkan ID            |
| `/api/books`                          | POST   | Tambah buku baru                            |
| `/api/books/:id`                      | PUT    | Update data buku                            |
| `/api/books/:id`                      | DELETE | Hapus buku                                  |
| `/api/books/featured`                 | GET    | Lihat buku unggulan (featured)              |
| `/api/books/popular`                  | GET    | Lihat buku populer                          |
| `/api/books/new`                      | GET    | Lihat buku baru (new arrivals)              |
| `/api/books/author/:authorName`       | GET    | Lihat buku berdasarkan penulis              |
| `/api/books/with-genres`              | GET    | Lihat semua buku beserta genre              |
| `/api/books/:id/genres`               | PUT    | Update genre buku tertentu                  |
| `/api/books/:id/with-genres`          | GET    | Lihat detail buku beserta genre             |
| `/api/books/:id/with-genres`          | DELETE | Hapus buku beserta genre                    |
|                                       |        |                                             |
| `/api/borrowings`                     | GET    | Lihat semua peminjaman                      |
| `/api/borrowings/:id`                 | GET    | Lihat detail peminjaman                     |
| `/api/borrowings`                     | POST   | Pinjam buku                                 |
| `/api/borrowings/:id/return`          | PUT    | Kembalikan buku                             |
| `/api/borrowings/:id`                 | DELETE | Hapus data peminjaman                       |
|                                       |        |                                             |
| `/api/genres`                         | GET    | Lihat semua genre                           |
| `/api/genres/:id`                     | GET    | Lihat detail genre                          |
| `/api/genres`                         | POST   | Tambah genre baru                           |
| `/api/genres/:id`                     | PUT    | Update genre                                |
| `/api/genres/:id`                     | DELETE | Hapus genre                                 |
|                                       |        |                                             |
| `/api/users`                          | GET    | Lihat semua user                            |
| `/api/users/:id`                      | GET    | Lihat detail user                           |
| `/api/users`                          | POST   | Tambah user baru                            |
| `/api/users/:id`                      | PUT    | Update data user                            |
| `/api/users/:id`                      | DELETE | Hapus user                                  |
|                                       |        |                                             |
| `/api/auth/login`                     | POST   | Login user                                  |
| `/api/auth/register`                  | POST   | Register user baru                          |
| `/api/auth/logout`                    | POST   | Logout user                                 |
|                                       |        |                                             |
| `/api/user-interactions`              | GET    | Lihat semua interaksi user                  |
| `/api/user-interactions/:id`          | GET    | Lihat detail interaksi user                 |
| `/api/user-interactions`              | POST   | Tambah interaksi user                       |
| `/api/user-interactions/:id`          | PUT    | Update interaksi user                       |
| `/api/user-interactions/:id`          | DELETE | Hapus interaksi user                        |

Catatan: Beberapa endpoint bisa berbeda tergantung implementasi, namun tabel di atas mencakup resource utama di backend SmartLibrary.

---

## 🏗️ Contoh Model Data Buku (bookModel.js)

```js
{
  title: "Harry Potter",
  author: "J.K. Rowling",
  coverImage: "url_gambar.jpg",
  description: "Buku tentang penyihir muda",
  publishDate: "2001-07-21",
  pageCount: 350,
  isbn: "1234567890",
  isAvailable: true,
  isPopular: false
}
```

---

## ⚙️ Cara Menjalankan Backend

1. **Install dependensi:**
   ```bash
   npm install
   ```
2. **Buat file .env** (isi dengan koneksi database, contoh: `MONGODB_URI=mongodb://localhost:27017/smartlibrary`)
3. **Jalankan server:**
   ```bash
   npm start
   ```
4. **Cek di browser/Postman:**
   - Contoh: `http://localhost:3000/api/books`

---

## 📝 Istilah Penting
- **Database:** Tempat menyimpan data (buku, user, dsb).
- **API:** Cara aplikasi ngobrol dengan backend.
- **Endpoint:** Alamat khusus untuk permintaan tertentu.
- **CRUD:** Create, Read, Update, Delete (tambah, lihat, ubah, hapus data).
- **Middleware:** Fungsi perantara (misal: cek login).

---

## 🧑‍💻 Kode-Kode Penting

### 1. Koneksi ke Database (config/db.js)
```js
const { MongoClient } = require('mongodb');
let db;
const connectToDb = async (cb) => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGODB_URI belum di-set');
    }
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    cb();
  } catch (err) {
    console.error('DB Connection Error:', err);
    cb(err);
  }
};
const getDb = () => db;
module.exports = { connectToDb, getDb };
```
**Keterangan:**
- Menghubungkan backend ke database MongoDB.


---

### 2. Contoh Model Buku (models/bookModel.js)
```js
class BookModel {
  static schema = {
    title: { type: 'string', required: true, maxLength: 100 },
    author: { type: 'string', required: true, maxLength: 50 },
    // ...
  };
  static async findAll(options = {}) {
    const db = getDb();
    // ...
    const books = await db.collection('books').find(query).toArray();
    return books;
  }
  // ...
}
```
**Keterangan:**
- Menentukan aturan data buku (schema).
- Fungsi `findAll` untuk mengambil semua data buku dari database.

---

### 3. Contoh Controller Buku (controllers/bookController.js)
```js
const BookModel = require('../models/bookModel');
exports.getAllBooks = async (req, res) => {
  try {
    const books = await BookModel.findAll();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Keterangan:**
- Mengatur logika saat ada permintaan "lihat semua buku".
- Jika berhasil, kirim data buku ke user. Jika gagal, kirim error.

---

### 4. Contoh Route Buku (routes/bookRoutes.js)
```js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
router.get('/', bookController.getAllBooks);
// ... route lain
module.exports = router;
```
**Keterangan:**
- Menyambungkan URL `/api/books` ke fungsi di controller.

---

### 5. Middleware Auth (middleware/auth.js)
```js
module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... verifikasi token
  next();
};
```
**Keterangan:**
- Mengecek apakah user sudah login sebelum akses fitur tertentu.

---

### 6. Menyalakan Server (server.js)
```js
const express = require('express');
const app = express();
const { connectToDb } = require('./config/db');
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => console.log('Server running on port 3000'));
  }
});
```
**Keterangan:**
- Menyalakan server backend di port 3000 setelah berhasil konek ke database.

 utama backend SmartLibrary. Jika ingin tahu detail lebih lanjut, buka file terkait di folder backend.

