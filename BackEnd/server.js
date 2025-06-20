//framework untuk buat server di Node.js
const express = require('express');
const cors = require('cors');
// const { ObjectId } = require('mongodb');
// const { connectToDb, getDb } = require('./db');
const peminjamanRoutes = require('./controllers/peminjaman');
// const aiRoutes = require('./src/routes/aiRoutes');

//baca file .env
require('dotenv').config();

// // //untuk konek dan berinteraksi dengan MongoDB
// // const mongoose = require('mongoose');

//Inisialisasi aplikasi Express
const app = express();

// // //port untuk server
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ===================== ROUTES =====================

// Nonaktifkan koneksi database sementara (in-memory only)
// let db;
// connectToDb((err) => {
//     if (err) {
//         console.error('Database connection error:', err);
//         return;
//     }
//
//     app.listen(port, () => {
//         console.log(`Server berjalan di http://localhost:${port}`);
//     });
//     db = getDb();
// });

// Jalankan server langsung tanpa database
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

// Books Routes (DISABLED - membutuhkan database)
// app.get('/api/books', ...)
// app.get('/api/books/:id', ...)
// app.post('/api/books', ...)
// app.delete('/api/books/:id', ...)
// app.patch('/api/books/:id', ...)

// AI Routes
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Simulasi respons AI sederhana
        const response = {
            message: `Ini adalah respons AI untuk: "${message}"`,
            timestamp: new Date()
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error in AI chat:', error);
        res.status(500).json({ error: 'Failed to process AI request' });
    }
});

// Routes
app.use(peminjamanRoutes);
