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
        
        # Hapus handler yang sudah ada untuk menghindari duplikasi
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Custom formatter dengan warna untuk terminal
        class ColoredFormatter(logging.Formatter):
            """Custom formatter dengan warna untuk terminal"""
            
            COLORS = {
                'DEBUG': '\033[36m',    # Cyan
                'INFO': '\033[32m',     # Green
                'WARNING': '\033[33m',  # Yellow
                'ERROR': '\033[31m',    # Red
                'CRITICAL': '\033[35m', # Magenta
                'RESET': '\033[0m'      # Reset
            }
            
            def format(self, record):
                # Tambahkan warna untuk level
                level_color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
                record.levelname = f"{level_color}{record.levelname}{self.COLORS['RESET']}"
                
                # Tambahkan prefix berdasarkan level (tanpa emoji untuk kompatibilitas Windows)
                prefix_map = {
                    'DEBUG': '[DEBUG]',
                    'INFO': '[INFO]',
                    'WARNING': '[WARN]',
                    'ERROR': '[ERROR]',
                    'CRITICAL': '[CRIT]'
                }
                prefix = prefix_map.get(record.levelname.replace(level_color, '').replace(self.COLORS['RESET'], ''), '')
                
                # Format pesan dengan prefix
                if prefix:
                    record.msg = f"{prefix} {record.msg}"
                
                return super().format(record)
        
        # Console handler dengan warna
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(ColoredFormatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        self.logger.addHandler(console_handler)
        
        # File handler (opsional) - tanpa warna
        if log_file:
            # Buat direktori logs jika belum ada
            os.makedirs('logs', exist_ok=True)
            file_handler = logging.FileHandler(f'logs/{log_file}')
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            ))
            self.logger.addHandler(file_handler)
        
        # Prevent propagation to root logger
        self.logger.propagate = False
    
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
        # Mask sensitive data
        masked_user_id = self._mask_user_id(user_id)
        masked_message = self._mask_sensitive_data(message[:100])
        masked_response = self._mask_sensitive_data(response[:100])
        self.logger.info(f"Chat - User: {masked_user_id}, Message: {masked_message}..., Response: {masked_response}...")
    
    def log_recommendation(self, user_id: str, method: str, recommendations_count: int):
        """Log recommendation request"""
        self.logger.info(f"Recommendation - User: {user_id}, Method: {method}, Count: {recommendations_count}")
    
    def log_error(self, service: str, error: str):
        """Log error"""
        self.logger.error(f"Error in {service}: {error}")
    
    def log_performance(self, service: str, operation: str, duration: float):
        """Log performance metrics"""
        self.logger.info(f"Performance - {service}:{operation} took {duration:.2f}s")
    
    def _mask_user_id(self, user_id: str) -> str:
        """Mask user ID untuk keamanan"""
        if not user_id:
            return "anonymous"
        if len(user_id) <= 4:
            return user_id
        return user_id[:2] + "*" * (len(user_id) - 4) + user_id[-2:]
    
    def _mask_sensitive_data(self, text: str) -> str:
        """Mask sensitive data dalam text"""
        if not text:
            return ""
        
        # Mask email addresses
        import re
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
        
        # Mask phone numbers
        text = re.sub(r'\b\d{10,}\b', '[PHONE]', text)
        
        # Mask credit card numbers
        text = re.sub(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', '[CARD]', text)
        
        # Mask passwords/keywords
        sensitive_keywords = ['password', 'passwd', 'secret', 'key', 'token', 'api_key', 'private']
        for keyword in sensitive_keywords:
            if keyword.lower() in text.lower():
                text = re.sub(rf'\b{keyword}\b', '[SENSITIVE]', text, flags=re.IGNORECASE)
        
        return text

# Global logger instance
ai_logger = AILogger() 