from flask import Flask, request, jsonify
from flask_cors import CORS
from services.book_ai_service import BookAIService
from services.recommendation_service import RecommendationService
from services.user_preference_service import UserPreferenceService
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Inisialisasi services
book_ai_service = BookAIService()
recommendation_service = RecommendationService()
user_preference_service = UserPreferenceService()

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint untuk health check"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI Services are running'
    })

# Book AI Chat Endpoints
@app.route('/ai/chat', methods=['POST'])
def chat():
    """Endpoint untuk chat dengan AI"""
    try:
        data = request.get_json()
        message = data.get('message')
        user_id = data.get('user_id')
        book_id = data.get('book_id')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        response = book_ai_service.chat(message, user_id, book_id)
        return jsonify({'response': response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ai/chat/clear', methods=['POST'])
def clear_chat():
    """Endpoint untuk membersihkan riwayat chat"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        book_ai_service.clear_conversation_history(user_id)
        return jsonify({'message': 'Chat history cleared successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Recommendation Endpoints
@app.route('/recommendations/content-based', methods=['POST'])
def content_based_recommendations():
    """Endpoint untuk rekomendasi berbasis konten"""
    try:
        data = request.get_json()
        book_id = data.get('book_id')
        n_recommendations = data.get('n_recommendations', 5)
        
        if not book_id:
            return jsonify({'error': 'Book ID is required'}), 400
        
        recommendations = recommendation_service.get_content_based_recommendations(
            book_id, n_recommendations
        )
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations/collaborative', methods=['POST'])
def collaborative_recommendations():
    """Endpoint untuk rekomendasi collaborative filtering"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        n_recommendations = data.get('n_recommendations', 5)
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        recommendations = recommendation_service.get_collaborative_recommendations(
            user_id, n_recommendations
        )
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations/ai-enhanced', methods=['POST'])
def ai_enhanced_recommendations():
    """Endpoint untuk rekomendasi yang ditingkatkan dengan AI"""
    try:
        data = request.get_json()
        user_preferences = data.get('user_preferences')
        n_recommendations = data.get('n_recommendations', 5)
        
        if not user_preferences:
            return jsonify({'error': 'User preferences are required'}), 400
        
        recommendations = recommendation_service.get_ai_enhanced_recommendations(
            user_preferences, n_recommendations
        )
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations/hybrid', methods=['POST'])
def hybrid_recommendations():
    """Endpoint untuk rekomendasi hybrid"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        book_id = data.get('book_id')
        user_preferences = data.get('user_preferences')
        n_recommendations = data.get('n_recommendations', 5)
        
        recommendations = recommendation_service.get_hybrid_recommendations(
            user_id, book_id, user_preferences, n_recommendations
        )
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Preference Endpoints
@app.route('/user/preferences', methods=['GET'])
def get_user_preferences():
    """Endpoint untuk mendapatkan preferensi pengguna"""
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        preferences = user_preference_service.analyze_user_preferences(user_id)
        return jsonify({'preferences': preferences})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user/similar-users', methods=['GET'])
def get_similar_users():
    """Endpoint untuk mendapatkan pengguna yang serupa"""
    try:
        user_id = request.args.get('user_id')
        n_similar_users = int(request.args.get('n_similar_users', 5))
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        similar_users = user_preference_service.find_similar_users(user_id, n_similar_users)
        return jsonify({'similar_users': similar_users})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('AI_SERVICE_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    app.run(host='0.0.0.0', port=port, debug=debug) 