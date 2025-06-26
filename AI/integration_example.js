/**
 * Contoh integrasi SmartLibrary AI Services dengan Backend Node.js
 * Tambahkan kode ini ke backend Anda
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Middleware untuk menangani request ke AI service
 */
const aiServiceMiddleware = async (req, res, next) => {
    try {
        // Tambahkan AI service URL ke request object
        req.aiServiceUrl = AI_SERVICE_URL;
        next();
    } catch (error) {
        console.error('AI Service middleware error:', error);
        next(error);
    }
};

/**
 * Helper function untuk request ke AI service
 */
const callAIService = async (endpoint, method = 'GET', data = null) => {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 detik timeout
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`AI Service error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error calling AI service ${endpoint}:`, error);
        throw error;
    }
};

/**
 * Routes untuk AI Chat
 */
const setupAIChatRoutes = (app) => {
    // Chat dengan AI
    app.post('/api/ai/chat', async (req, res) => {
        try {
            const { message, user_id, book_id } = req.body;
            
            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            const response = await callAIService('/ai/chat', 'POST', {
                message,
                user_id,
                book_id
            });

            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Clear chat history
    app.post('/api/ai/chat/clear', async (req, res) => {
        try {
            const { user_id } = req.body;
            
            if (!user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const response = await callAIService('/ai/chat/clear', 'POST', { user_id });
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

/**
 * Routes untuk Rekomendasi
 */
const setupRecommendationRoutes = (app) => {
    // Content-based recommendations
    app.post('/api/recommendations/content-based', async (req, res) => {
        try {
            const { book_id, n_recommendations = 5 } = req.body;
            
            if (!book_id) {
                return res.status(400).json({ error: 'Book ID is required' });
            }

            const response = await callAIService('/recommendations/content-based', 'POST', {
                book_id,
                n_recommendations
            });

            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Collaborative recommendations
    app.post('/api/recommendations/collaborative', async (req, res) => {
        try {
            const { user_id, n_recommendations = 5 } = req.body;
            
            if (!user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const response = await callAIService('/recommendations/collaborative', 'POST', {
                user_id,
                n_recommendations
            });

            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // AI-enhanced recommendations
    app.post('/api/recommendations/ai-enhanced', async (req, res) => {
        try {
            const { user_preferences, n_recommendations = 5 } = req.body;
            
            if (!user_preferences) {
                return res.status(400).json({ error: 'User preferences are required' });
            }

            const response = await callAIService('/recommendations/ai-enhanced', 'POST', {
                user_preferences,
                n_recommendations
            });

            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Hybrid recommendations
    app.post('/api/recommendations/hybrid', async (req, res) => {
        try {
            const { user_id, book_id, user_preferences, n_recommendations = 5 } = req.body;

            const response = await callAIService('/recommendations/hybrid', 'POST', {
                user_id,
                book_id,
                user_preferences,
                n_recommendations
            });

            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

/**
 * Routes untuk User Preferences
 */
const setupUserPreferenceRoutes = (app) => {
    // Get user preferences
    app.get('/api/user/preferences', async (req, res) => {
        try {
            const { user_id } = req.query;
            
            if (!user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const response = await callAIService(`/user/preferences?user_id=${user_id}`);
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get similar users
    app.get('/api/user/similar-users', async (req, res) => {
        try {
            const { user_id, n_similar_users = 5 } = req.query;
            
            if (!user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const response = await callAIService(
                `/user/similar-users?user_id=${user_id}&n_similar_users=${n_similar_users}`
            );
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

/**
 * Health check untuk AI service
 */
const checkAIServiceHealth = async () => {
    try {
        const response = await callAIService('/health');
        console.log('AI Service health check:', response);
        return true;
    } catch (error) {
        console.error('AI Service health check failed:', error);
        return false;
    }
};

/**
 * Setup semua routes AI
 */
const setupAIRoutes = (app) => {
    // Gunakan middleware
    app.use(aiServiceMiddleware);

    // Setup semua route groups
    setupAIChatRoutes(app);
    setupRecommendationRoutes(app);
    setupUserPreferenceRoutes(app);

    // Health check endpoint
    app.get('/api/ai/health', async (req, res) => {
        try {
            const isHealthy = await checkAIServiceHealth();
            res.json({ 
                status: isHealthy ? 'healthy' : 'unhealthy',
                ai_service_url: AI_SERVICE_URL 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

module.exports = {
    setupAIRoutes,
    checkAIServiceHealth,
    callAIService
}; 