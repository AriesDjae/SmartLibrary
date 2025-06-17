//framework untuk buat server di Node.js
const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');
const authRoutes = require('./src/routes/authRoutes');
// const aiRoutes = require('./src/routes/aiRoutes');

//baca file .env
require('dotenv').config();

// // //untuk konek dan berinteraksi dengan MongoDB
// // const mongoose = require('mongoose');

// //Inisialisasi aplikasi Express
const app = express();

// // //port untuk server
const port = process.env.PORT || 3000;

// // Middleware untuk parsing request body dalam format JSON
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// //db connection
let db;
connectToDb((err) => {
    if (!err) {
        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        })
        db = getDb()
    }
})

// ===================== ROUTES =====================

// Auth routes
app.use('/api/auth', authRoutes);

app.get('/api/books', (req, res) => {

    //current page
    const page = req.query.p || 0
    const booksPerPage = 3

    let books = []

    db.collection('books')
        .find() //cursor to Array forEach
        .sort({ author: 1 }) //1 for ascending, -1 for descending
        .skip(page * booksPerPage)
        .limit(booksPerPage)
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' })
        })
});

app.get('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    db.collection('books')
        .findOne({ _id: bookId })
        .then(doc => {
            res.status(200).json(doc)
        })
        .catch(err => {
            res.status(500).json({ error: 'Could not fetch the documents' })
        })
})

app.post('/api/books', (req, res) => {
    const book = req.body

    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({ err: 'could not create a new document' })
        })
})

//delete by id
app.delete('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    db.collection('books')
        .deleteOne({ _id: bookId })
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json({ error: 'Could not delete the documents' })
        })
})

app.patch('/api/books/:id', (req, res) => {
    const updates = req.body
    const bookId = req.params.id;
    db.collection('books')
        .updateOne({ _id: bookId }, { $set: updates })
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json({ error: 'Could not update the documents' })
        })
})

// Routes
// app.use('/api/ai', aiRoutes);