//framework untuk buat server di Node.js
const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');
// const aiRoutes = require('./src/routes/aiRoutes');

//baca file .env
require('dotenv').config();

// // //untuk konek dan berinteraksi dengan MongoDB
// // const mongoose = require('mongoose');

// //Inisialisasi aplikasi Express
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

// //db connection
let db;
connectToDb((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }

    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });
    db = getDb();
});

// ===================== ROUTES =====================

// Books Routes
app.get('/api/books', (req, res) => {
    const page = req.query.p || 0;
    const booksPerPage = 3;
    let books = [];

    db.collection('books')
        .find()
        .sort({ author: 1 })
        .skip(page * booksPerPage)
        .limit(booksPerPage)
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books);
        })
        .catch((err) => {
            console.error('Error fetching books:', err);
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
});

app.get('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    db.collection('books')
        .findOne({ _id: new ObjectId(bookId) })
        .then(doc => {
            if (!doc) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.status(200).json(doc);
        })
        .catch(err => {
            console.error('Error fetching book:', err);
            res.status(500).json({ error: 'Could not fetch the document' });
        });
});

app.post('/api/books', (req, res) => {
    const book = req.body;
    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            console.error('Error creating book:', err);
            res.status(500).json({ error: 'Could not create a new document' });
        });
});

app.delete('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    db.collection('books')
        .deleteOne({ _id: new ObjectId(bookId) })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.status(200).json(result);
        })
        .catch(err => {
            console.error('Error deleting book:', err);
            res.status(500).json({ error: 'Could not delete the document' });
        });
});

app.patch('/api/books/:id', (req, res) => {
    const updates = req.body;
    const bookId = req.params.id;
    db.collection('books')
        .updateOne({ _id: new ObjectId(bookId) }, { $set: updates })
        .then(result => {
            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.status(200).json(result);
        })
        .catch(err => {
            console.error('Error updating book:', err);
            res.status(500).json({ error: 'Could not update the document' });
        });
});

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
app.use('/api/', Routes);
