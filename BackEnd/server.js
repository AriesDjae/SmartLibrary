//framework untuk buat server di Node.js
const express = require('express');

//untuk konek dan berinteraksi dengan MongoDB
const mongoose = require('mongoose');

//baca file .env
require('dotenv').config();

//Inisialisasi aplikasi Express
const app = express();
const port = 3000;

// // Tentukan port (ambil dari env kalau ada, kalau nggak default ke 3000)
// const PORT = process.env.PORT || 3000;

// Middleware untuk parsing request body dalam format JSON
app.use(express.json());

// ===================== KONEKSI KE MONGODB =====================

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));

// ===================== ROUTE CONTOH =====================
app.get('/', (req, res) => {
  res.send("Hello World I'am Node.js!");
});

// ===================== JALANKAN SERVER =====================
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});