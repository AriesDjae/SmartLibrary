#!/usr/bin/env python3
"""
Script untuk menjalankan SmartLibrary AI Services
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Tambahkan direktori AI ke path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.settings import get_config, Config
from utils.logger import ai_logger

def main():
    """Main function untuk menjalankan aplikasi"""
    try:
        # Validasi konfigurasi
        Config.validate()
        
        # Dapatkan konfigurasi berdasarkan environment
        config = get_config()
        
        # Import app setelah validasi konfigurasi
        from app import app
        
        # Setup logging
        ai_logger.logger.info(f"Starting SmartLibrary AI Services on port {config.AI_SERVICE_PORT}")
        ai_logger.logger.info(f"Environment: {os.getenv('FLASK_ENV', 'default')}")
        ai_logger.logger.info(f"Debug mode: {config.FLASK_DEBUG}")
        
        # Jalankan aplikasi
        app.run(
            host=config.AI_SERVICE_HOST,
            port=config.AI_SERVICE_PORT,
            debug=config.FLASK_DEBUG
        )
        
    except Exception as e:
        print(f"Error starting application: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 