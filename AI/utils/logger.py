import logging
import os
from datetime import datetime
from typing import Optional

class Logger:
    """Utility class untuk logging"""
    
    def __init__(self, name: str, log_file: Optional[str] = None):
        """Inisialisasi logger"""
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Format log
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler (opsional)
        if log_file:
            # Buat direktori logs jika belum ada
            os.makedirs('logs', exist_ok=True)
            file_handler = logging.FileHandler(f'logs/{log_file}')
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def info(self, message: str):
        """Log info message"""
        self.logger.info(message)
    
    def error(self, message: str):
        """Log error message"""
        self.logger.error(message)
    
    def warning(self, message: str):
        """Log warning message"""
        self.logger.warning(message)
    
    def debug(self, message: str):
        """Log debug message"""
        self.logger.debug(message)
    
    def critical(self, message: str):
        """Log critical message"""
        self.logger.critical(message)

class AILogger:
    """Logger khusus untuk AI services"""
    
    def __init__(self):
        """Inisialisasi AI Logger"""
        timestamp = datetime.now().strftime('%Y%m%d')
        self.logger = Logger('AI_Services', f'ai_services_{timestamp}.log')
    
    def log_chat(self, user_id: str, message: str, response: str):
        """Log chat interaction"""
        self.logger.info(f"Chat - User: {user_id}, Message: {message[:100]}..., Response: {response[:100]}...")
    
    def log_recommendation(self, user_id: str, method: str, recommendations_count: int):
        """Log recommendation request"""
        self.logger.info(f"Recommendation - User: {user_id}, Method: {method}, Count: {recommendations_count}")
    
    def log_error(self, service: str, error: str):
        """Log error"""
        self.logger.error(f"Error in {service}: {error}")
    
    def log_performance(self, service: str, operation: str, duration: float):
        """Log performance metrics"""
        self.logger.info(f"Performance - {service}:{operation} took {duration:.2f}s")

# Global logger instance
ai_logger = AILogger() 