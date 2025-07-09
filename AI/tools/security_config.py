#!/usr/bin/env python3
"""
Konfigurasi Keamanan untuk SmartLibrary AI Services
"""

import os
import re
from typing import List, Dict, Any

class SecurityConfig:
    """Konfigurasi keamanan aplikasi"""
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_REQUESTS', '100'))
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', '3600'))  # 1 hour
    
    # Input validation
    MAX_MESSAGE_LENGTH = int(os.getenv('MAX_MESSAGE_LENGTH', '1000'))
    MAX_USER_ID_LENGTH = int(os.getenv('MAX_USER_ID_LENGTH', '50'))
    MAX_BOOK_ID_LENGTH = int(os.getenv('MAX_BOOK_ID_LENGTH', '50'))
    
    # File upload security
    ALLOWED_FILE_EXTENSIONS = ['.json', '.txt', '.csv']
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', '1048576'))  # 1MB
    
    # CORS settings
    ALLOWED_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Sensitive data patterns
    SENSITIVE_PATTERNS = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'phone': r'\b\d{10,}\b',
        'credit_card': r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
        'api_key': r'\b(api_key|token|secret|password)\b',
        'mongodb_uri': r'mongodb(\+srv)?://[^@]+@[^/]+',
    }
    
    # Dangerous patterns for file paths
    DANGEROUS_PATH_PATTERNS = [
        '..', '../', '..\\', './', '.\\', '/', '\\',
        'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 
        'N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'
    ]
    
    # HTML/script injection patterns
    INJECTION_PATTERNS = [
        r'<script.*?</script>',
        r'<[^>]+>',
        r'javascript:',
        r'on\w+\s*=',
        r'data:text/html',
    ]
    
    @classmethod
    def sanitize_input(cls, text: str) -> str:
        """Sanitasi input text"""
        if not text:
            return ""
        
        # Hapus karakter kontrol
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
        
        # Hapus injection patterns
        for pattern in cls.INJECTION_PATTERNS:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Batasi panjang
        if len(text) > cls.MAX_MESSAGE_LENGTH:
            text = text[:cls.MAX_MESSAGE_LENGTH]
        
        return text.strip()
    
    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitasi nama file"""
        if not filename:
            return "export"
        
        # Hapus karakter berbahaya
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        
        # Hapus path traversal
        for pattern in cls.DANGEROUS_PATH_PATTERNS:
            filename = filename.replace(pattern, '')
        
        # Batasi panjang
        if len(filename) > 50:
            filename = filename[:50]
        
        return filename.strip()
    
    @classmethod
    def mask_sensitive_data(cls, text: str) -> str:
        """Mask sensitive data dalam text"""
        if not text:
            return ""
        
        # Mask patterns
        for pattern_name, pattern in cls.SENSITIVE_PATTERNS.items():
            if pattern_name == 'email':
                text = re.sub(pattern, '[EMAIL]', text)
            elif pattern_name == 'phone':
                text = re.sub(pattern, '[PHONE]', text)
            elif pattern_name == 'credit_card':
                text = re.sub(pattern, '[CARD]', text)
            elif pattern_name == 'api_key':
                text = re.sub(pattern, '[SENSITIVE]', text, flags=re.IGNORECASE)
            elif pattern_name == 'mongodb_uri':
                text = cls._mask_mongodb_uri(text)
        
        return text
    
    @classmethod
    def _mask_mongodb_uri(cls, uri: str) -> str:
        """Mask MongoDB URI"""
        if not uri or 'mongodb://' not in uri:
            return uri
        
        try:
            if 'mongodb+srv://' in uri:
                parts = uri.split('@')
                if len(parts) >= 2:
                    credentials = parts[0].replace('mongodb+srv://', '')
                    if ':' in credentials:
                        username = credentials.split(':')[0]
                        return f"mongodb+srv://{username}:***@{parts[1]}"
            elif 'mongodb://' in uri:
                parts = uri.split('@')
                if len(parts) >= 2:
                    credentials = parts[0].replace('mongodb://', '')
                    if ':' in credentials:
                        username = credentials.split(':')[0]
                        return f"mongodb://{username}:***@{parts[1]}"
            
            return uri
        except:
            return "mongodb://***:***@***"
    
    @classmethod
    def validate_user_id(cls, user_id: str) -> bool:
        """Validasi user ID"""
        if not user_id:
            return False
        
        # Hanya alphanumeric, underscore, dan dash
        if not re.match(r'^[a-zA-Z0-9_-]+$', user_id):
            return False
        
        # Batasi panjang
        if len(user_id) > cls.MAX_USER_ID_LENGTH:
            return False
        
        return True
    
    @classmethod
    def validate_book_id(cls, book_id: str) -> bool:
        """Validasi book ID"""
        if not book_id:
            return False
        
        # Hanya alphanumeric, underscore, dan dash
        if not re.match(r'^[a-zA-Z0-9_-]+$', book_id):
            return False
        
        # Batasi panjang
        if len(book_id) > cls.MAX_BOOK_ID_LENGTH:
            return False
        
        return True
    
    @classmethod
    def is_safe_path(cls, filepath: str) -> bool:
        """Validasi path untuk mencegah directory traversal"""
        if not filepath:
            return False
        
        filepath_lower = filepath.lower()
        
        # Cek dangerous patterns
        for pattern in cls.DANGEROUS_PATH_PATTERNS:
            if pattern in filepath_lower:
                return False
        
        # Pastikan file hanya di direktori saat ini
        import os
        current_dir = os.getcwd()
        full_path = os.path.join(current_dir, filepath)
        
        try:
            full_path = os.path.abspath(full_path)
            current_dir = os.path.abspath(current_dir)
            return full_path.startswith(current_dir)
        except:
            return False 