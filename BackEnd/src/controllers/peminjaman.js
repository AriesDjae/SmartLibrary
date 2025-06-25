const express = require('express');
// const { ObjectId } = require('mongodb');
// const { getDb } = require('./db');

// OOP Class untuk Peminjaman
class Peminjaman {
  constructor({ userId, bookId, title, author, borrowedDate, dueDate, status, cover, category, description }) {
    this.userId = userId;
    this.bookId = bookId;
    this.title = title;
    this.author = author;
    this.borrowedDate = borrowedDate;
    this.dueDate = dueDate;
    this.status = status;
    this.cover = cover;
    this.category = category;
    this.description = description;
    this.createdAt = new Date();
  }
}

const router = express.Router();

// Simpan data peminjaman sementara di memory
const peminjamanList = [];

// Endpoint untuk menyimpan peminjaman buku (in-memory)
router.post('/api/peminjaman', (req, res) => {
  try {
    const peminjamanData = req.body;
    const peminjaman = new Peminjaman(peminjamanData);
    peminjamanList.push(peminjaman); // Simpan ke array
    res.status(201).json({ success: true, peminjaman });
  } catch (err) {
    console.error('Error creating peminjaman:', err);
    res.status(500).json({ error: 'Could not create peminjaman' });
  }
});

// Endpoint untuk mengambil list peminjaman buku (in-memory)
router.get('/api/peminjaman', (req, res) => {
  try {
    res.status(200).json(peminjamanList);
  } catch (err) {
    console.error('Error fetching peminjaman:', err);
    res.status(500).json({ error: 'Could not fetch peminjaman list' });
  }
});

module.exports = router;
