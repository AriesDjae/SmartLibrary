const aiService = require('../services/aiService');

class AIController {
    async getRecommendations(req, res) {
        try {
            const { userId, bookId, preferences } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID diperlukan'
                });
            }

            const recommendations = await aiService.getRecommendations(
                userId,
                bookId,
                preferences
            );

            res.json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateUserPreferences(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID diperlukan'
                });
            }

            const preferences = await aiService.updateUserPreferences(userId);

            res.json({
                success: true,
                data: preferences
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async chat(req, res) {
        try {
            const { message, userId, bookId } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Pesan diperlukan'
                });
            }

            const response = await aiService.getRecommendations(
                userId,
                bookId,
                message
            );

            res.json({
                success: true,
                data: response
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AIController(); 