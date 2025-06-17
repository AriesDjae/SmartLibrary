const { spawn } = require('child_process');
const path = require('path');
const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');

class AIService {
    constructor() {
        this.pythonPath = 'python';
        this.aiScriptPath = path.join(__dirname, '../../../AI/Chat/bookAI.py');
    }

    async getRecommendations(userId, bookId = null, preferences = null) {
        try {
            const pythonProcess = spawn(this.pythonPath, [
                this.aiScriptPath,
                '--user_id', userId,
                '--book_id', bookId || '',
                '--preferences', preferences || ''
            ]);

            return new Promise((resolve, reject) => {
                let result = '';
                let error = '';

                pythonProcess.stdout.on('data', (data) => {
                    result += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    error += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Python process exited with code ${code}: ${error}`));
                    } else {
                        try {
                            const recommendations = JSON.parse(result);
                            resolve(recommendations);
                        } catch (e) {
                            reject(new Error('Failed to parse AI response'));
                        }
                    }
                });
            });
        } catch (error) {
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }

    async updateUserPreferences(userId) {
        try {
            // Ambil data user
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            // Ambil riwayat membaca user
            const reviews = await Review.find({ userId });
            const bookIds = reviews.map(review => review.bookId);
            const books = await Book.find({ _id: { $in: bookIds } });

            // Update preferensi user di MongoDB
            const preferences = {
                userId,
                genres: this._extractGenres(books),
                authors: this._extractAuthors(books),
                topics: this._extractTopics(books),
                lastUpdated: new Date()
            };

            await User.findByIdAndUpdate(userId, { preferences });
            return preferences;
        } catch (error) {
            throw new Error(`Failed to update user preferences: ${error.message}`);
        }
    }

    _extractGenres(books) {
        const genreCount = {};
        books.forEach(book => {
            book.genre.forEach(g => {
                genreCount[g] = (genreCount[g] || 0) + 1;
            });
        });
        return Object.entries(genreCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([genre]) => genre);
    }

    _extractAuthors(books) {
        const authorCount = {};
        books.forEach(book => {
            authorCount[book.author] = (authorCount[book.author] || 0) + 1;
        });
        return Object.entries(authorCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([author]) => author);
    }

    _extractTopics(books) {
        // Implementasi ekstraksi topik dari deskripsi buku
        // Ini bisa menggunakan NLP atau keyword extraction
        return books
            .map(book => book.description)
            .join(' ')
            .split(/\W+/)
            .filter(word => word.length > 3)
            .slice(0, 10);
    }
}

module.exports = new AIService(); 