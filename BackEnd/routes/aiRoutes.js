const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getDb } = require('../config/db'); 

// Konfigurasi AI Service
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Middleware untuk menangani error AI service
const handleAIError = (error) => {
    console.error('AI Service Error:', error.message);
    if (error.response) {
        return {
            success: false,
            error: error.response.data?.error || 'AI Service Error',
            status: error.response.status
        };
    }
    return {
        success: false,
        error: 'AI Service tidak tersedia',
        status: 503
    };
};

// Health check AI service
router.get('/health', async (req, res) => {
    try {
        console.log('🔍 Checking AI Service health...');
        const response = await axios.get(`${AI_SERVICE_URL}/health`, {
            timeout: 5000
        });
        console.log('✅ AI Service is healthy');
        res.json({
            success: true,
            ai_service: response.data,
            backend: 'healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ AI Service health check failed:', error.message);
        res.status(503).json(handleAIError(error));
    }
});

// Chat AI endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, user_id, book_id } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        console.log('🤖 AI Chat Request:', {
            user_id: user_id || 'anonymous',
            book_id: book_id || 'none',
            message_length: message.length
        });

        const response = await axios.post(`${AI_SERVICE_URL}/ai/chat`, {
            message,
            user_id: user_id || 'anonymous',
            book_id
        }, {
            timeout: 30000, // 30 detik timeout untuk AI
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ AI Chat Response received');
        res.json({
            success: true,
            response: response.data.response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ AI Chat Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

// Clear chat history
router.post('/chat/clear', async (req, res) => {
    try {
        const { user_id } = req.body;
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        console.log('🗑️ Clearing chat history for user:', user_id);

        const response = await axios.post(`${AI_SERVICE_URL}/ai/chat/clear`, {
            user_id
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Chat history cleared');
        res.json({
            success: true,
            message: response.data.message,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Clear Chat Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

// Content-based recommendations
router.post('/recommendations/content-based', async (req, res) => {
    try {
        const { book_id, n_recommendations = 5 } = req.body;
        
        if (!book_id) {
            return res.status(400).json({
                success: false,
                error: 'Book ID is required'
            });
        }

        console.log('📚 Content-based recommendations for book:', book_id);

        const response = await axios.post(`${AI_SERVICE_URL}/recommendations/content-based`, {
            book_id,
            n_recommendations
        }, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Content-based recommendations received');
        res.json({
            success: true,
            recommendations: response.data.recommendations,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Content-based Recommendations Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

// Collaborative recommendations
router.post('/recommendations/collaborative', async (req, res) => {
    try {
        const { user_id, n_recommendations = 5 } = req.body;
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        console.log('👥 Collaborative recommendations for user:', user_id);

        const response = await axios.post(`${AI_SERVICE_URL}/recommendations/collaborative`, {
            user_id,
            n_recommendations
        }, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Collaborative recommendations received');
        res.json({
            success: true,
            recommendations: response.data.recommendations,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Collaborative Recommendations Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

// AI-enhanced recommendations
router.post('/recommendations/ai-enhanced', async (req, res) => {
    try {
        const { user_preferences, n_recommendations = 5 } = req.body;
        
        if (!user_preferences) {
            return res.status(400).json({
                success: false,
                error: 'User preferences are required'
            });
        }

        console.log('🤖 AI-enhanced recommendations for preferences:', user_preferences.substring(0, 50) + '...');

        const response = await axios.post(`${AI_SERVICE_URL}/recommendations/ai-enhanced`, {
            user_preferences,
            n_recommendations
        }, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ AI-enhanced recommendations received');
        res.json({
            success: true,
            recommendations: response.data.recommendations,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ AI-enhanced Recommendations Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

// Hybrid recommendations
router.post('/recommendations/hybrid', async (req, res) => {
    try {
        const { user_id, book_id, user_preferences, n_recommendations = 5 } = req.body;
        
        // Minimal satu parameter harus ada
        if (!user_id && !book_id && !user_preferences) {
            return res.status(400).json({
                success: false,
                error: 'At least one parameter (user_id, book_id, or user_preferences) is required'
            });
        }

        console.log('🎯 Hybrid recommendations request:', {
            user_id: user_id || 'none',
            book_id: book_id || 'none',
            has_preferences: !!user_preferences
        });

        const response = await axios.post(`${AI_SERVICE_URL}/recommendations/hybrid`, {
            user_id,
            book_id,
            user_preferences,
            n_recommendations
        }, {
            timeout: 45000, // 45 detik timeout untuk hybrid
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Hybrid recommendations received');
        res.json({
            success: true,
            recommendations: response.data.recommendations,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Hybrid Recommendations Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

// User preferences analysis
router.get('/user/preferences', async (req, res) => {
    try {
        const { user_id } = req.query;
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        console.log('📊 Getting user preferences for:', user_id);

        const response = await axios.get(`${AI_SERVICE_URL}/user/preferences?user_id=${user_id}`, {
            timeout: 15000
        });

        console.log('✅ User preferences received');
        res.json({
            success: true,
            preferences: response.data.preferences,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ User Preferences Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

// Similar users
router.get('/user/similar-users', async (req, res) => {
    try {
        const { user_id, n_similar_users = 5 } = req.query;
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        console.log('👥 Getting similar users for:', user_id);

        const response = await axios.get(`${AI_SERVICE_URL}/user/similar-users?user_id=${user_id}&n_similar_users=${n_similar_users}`, {
            timeout: 15000
        });

        console.log('✅ Similar users received');
        res.json({
            success: true,
            similar_users: response.data.similar_users,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Similar Users Error:', error.message);
        res.status(500).json(handleAIError(error));
    }
});

module.exports = router; 