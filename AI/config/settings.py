import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Konfigurasi dasar aplikasi"""
    
    # Database
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'smartlibrary')
    
    # OpenAI
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')
    OPENAI_MAX_TOKENS = int(os.getenv('OPENAI_MAX_TOKENS', '500'))
    OPENAI_TEMPERATURE = float(os.getenv('OPENAI_TEMPERATURE', '0.7'))
    
    # Flask
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    AI_SERVICE_PORT = int(os.getenv('AI_SERVICE_PORT', '5001'))
    AI_SERVICE_HOST = os.getenv('AI_SERVICE_HOST', '0.0.0.0')
    
    # Machine Learning
    TFIDF_MAX_FEATURES = int(os.getenv('TFIDF_MAX_FEATURES', '5000'))
    TFIDF_NGRAM_RANGE = (1, 2)
    DEFAULT_RECOMMENDATIONS_COUNT = int(os.getenv('DEFAULT_RECOMMENDATIONS_COUNT', '5'))
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE_ENABLED = os.getenv('LOG_FILE_ENABLED', 'True').lower() == 'true'
    LOG_DIR = os.getenv('LOG_DIR', 'logs')
    
    # Security
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Cache
    CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'True').lower() == 'true'
    CACHE_TTL = int(os.getenv('CACHE_TTL', '3600'))  # 1 hour
    
    @classmethod
    def validate(cls):
        """Validasi konfigurasi yang diperlukan"""
        required_vars = ['MONGODB_URI']
        
        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        if not cls.OPENAI_API_KEY:
            print("Warning: OPENAI_API_KEY tidak ditemukan. AI-enhanced features akan dinonaktifkan.")

class DevelopmentConfig(Config):
    """Konfigurasi untuk development"""
    FLASK_DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Konfigurasi untuk production"""
    FLASK_DEBUG = False
    LOG_LEVEL = 'WARNING'
    CORS_ORIGINS = ['https://yourdomain.com']  # Ganti dengan domain yang sesuai

class TestingConfig(Config):
    """Konfigurasi untuk testing"""
    FLASK_DEBUG = True
    LOG_LEVEL = 'DEBUG'
    DATABASE_NAME = 'smartlibrary_test'

# Dictionary untuk memilih konfigurasi berdasarkan environment
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Mendapatkan konfigurasi berdasarkan environment"""
    env = os.getenv('FLASK_ENV', 'default')
    return config.get(env, config['default']) 