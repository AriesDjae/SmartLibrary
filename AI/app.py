from flask import Flask, request, jsonify
from flask_cors import CORS
from services.book_ai_service import BookAIService
from services.recommendation_service import RecommendationService
from services.user_preference_service import UserPreferenceService
import os
import time
from collections import defaultdict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Inisialisasi services
book_ai_service = BookAIService()
recommendation_service = RecommendationService()
user_preference_service = UserPreferenceService()

# Rate limiting
request_counts = defaultdict(list)
RATE_LIMIT = 100  # requests per hour
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds

def check_rate_limit(user_id):
    """Check rate limit untuk user"""
    current_time = time.time()
    user_requests = request_counts[user_id]
    
    # Hapus request yang sudah expired
    user_requests[:] = [req_time for req_time in user_requests if current_time - req_time < RATE_LIMIT_WINDOW]
    
    # Cek apakah melebihi limit
    if len(user_requests) >= RATE_LIMIT:
        return False
    
    # Tambahkan request baru
    user_requests.append(current_time)
    return True

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
        user_id = data.get('user_id', 'anonymous')
        book_id = data.get('book_id')
        
        # Rate limiting
        if not check_rate_limit(user_id):
            return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429
        
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
        from utils.logger import ai_logger
        
        data = request.get_json()
        user_id = data.get('user_id')
        book_id = data.get('book_id')
        user_preferences = data.get('user_preferences')
        n_recommendations = data.get('n_recommendations', 5)
        
        # Log request
        ai_logger.logger.info(f"🚀 HYBRID ENDPOINT CALLED")
        ai_logger.logger.info(f"   User ID: {user_id or 'None'}")
        ai_logger.logger.info(f"   Book ID: {book_id or 'None'}")
        ai_logger.logger.info(f"   User Preferences: {user_preferences[:100] + '...' if user_preferences and len(user_preferences) > 100 else user_preferences or 'None'}")
        ai_logger.logger.info(f"   N Recommendations: {n_recommendations}")
        
        recommendations = recommendation_service.get_hybrid_recommendations(
            user_id, book_id, user_preferences, n_recommendations
        )
        
        # Log response summary
        total_recs = sum(len(recs) for recs in recommendations.values())
        ai_logger.logger.info(f"📤 HYBRID RESPONSE SENT")
        ai_logger.logger.info(f"   Total Recommendations: {total_recs}")
        ai_logger.logger.info(f"   Content-Based: {len(recommendations['content_based'])}")
        ai_logger.logger.info(f"   Collaborative: {len(recommendations['collaborative'])}")
        ai_logger.logger.info(f"   AI-Enhanced: {len(recommendations['ai_enhanced'])}")
        
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        from utils.logger import ai_logger
        ai_logger.log_error("HybridEndpoint", str(e))
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