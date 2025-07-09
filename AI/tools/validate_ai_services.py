#!/usr/bin/env python3
"""
Script untuk validasi AI Services dan memastikan tidak ada bug
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List

class AIServicesValidator:
    """Validator untuk AI Services"""
    
    def __init__(self, base_url: str = "http://localhost:5001"):
        """Inisialisasi validator"""
        self.base_url = base_url
        self.test_results = []
        
    def test_health_endpoint(self) -> bool:
        """Test health endpoint"""
        try:
            print("🔍 Testing Health Endpoint...")
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    print("✅ Health endpoint berfungsi normal")
                    self.test_results.append(("Health Endpoint", "PASS", "Berfungsi normal"))
                    return True
                else:
                    print("❌ Health endpoint response tidak valid")
                    self.test_results.append(("Health Endpoint", "FAIL", "Response tidak valid"))
                    return False
            else:
                print(f"❌ Health endpoint gagal: {response.status_code}")
                self.test_results.append(("Health Endpoint", "FAIL", f"Status code: {response.status_code}"))
                return False
                
        except requests.exceptions.Timeout:
            print("❌ Health endpoint timeout")
            self.test_results.append(("Health Endpoint", "FAIL", "Timeout"))
            return False
        except Exception as e:
            print(f"❌ Health endpoint error: {str(e)}")
            self.test_results.append(("Health Endpoint", "FAIL", str(e)))
            return False
    
    def test_chat_endpoint(self) -> bool:
        """Test chat endpoint"""
        try:
            print("🤖 Testing Chat Endpoint...")
            
            test_data = {
                "message": "Saya suka novel fiksi ilmiah",
                "user_id": "test_user_123",
                "book_id": "test_book_456"
            }
            
            response = requests.post(
                f"{self.base_url}/ai/chat",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'response' in data and data['response']:
                    print("✅ Chat endpoint berfungsi normal")
                    self.test_results.append(("Chat Endpoint", "PASS", "Berfungsi normal"))
                    return True
                else:
                    print("❌ Chat endpoint response kosong")
                    self.test_results.append(("Chat Endpoint", "FAIL", "Response kosong"))
                    return False
            else:
                print(f"❌ Chat endpoint gagal: {response.status_code}")
                self.test_results.append(("Chat Endpoint", "FAIL", f"Status code: {response.status_code}"))
                return False
                
        except requests.exceptions.Timeout:
            print("❌ Chat endpoint timeout")
            self.test_results.append(("Chat Endpoint", "FAIL", "Timeout"))
            return False
        except Exception as e:
            print(f"❌ Chat endpoint error: {str(e)}")
            self.test_results.append(("Chat Endpoint", "FAIL", str(e)))
            return False
    
    def test_content_based_recommendations(self) -> bool:
        """Test content-based recommendations"""
        try:
            print("📊 Testing Content-Based Recommendations...")
            
            test_data = {
                "book_id": "test_book_123",
                "n_recommendations": 3
            }
            
            response = requests.post(
                f"{self.base_url}/recommendations/content-based",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'recommendations' in data:
                    recs = data['recommendations']
                    # Cek bahwa tidak ada scoring yang bocor
                    for rec in recs:
                        if any(key.startswith('_') for key in rec.keys()):
                            print("❌ Content-based: Scoring bocor ke user")
                            self.test_results.append(("Content-Based", "FAIL", "Scoring bocor ke user"))
                            return False
                    
                    print("✅ Content-based recommendations berfungsi normal")
                    self.test_results.append(("Content-Based", "PASS", "Berfungsi normal"))
                    return True
                else:
                    print("❌ Content-based response tidak valid")
                    self.test_results.append(("Content-Based", "FAIL", "Response tidak valid"))
                    return False
            else:
                print(f"❌ Content-based gagal: {response.status_code}")
                self.test_results.append(("Content-Based", "FAIL", f"Status code: {response.status_code}"))
                return False
                
        except Exception as e:
            print(f"❌ Content-based error: {str(e)}")
            self.test_results.append(("Content-Based", "FAIL", str(e)))
            return False
    
    def test_collaborative_recommendations(self) -> bool:
        """Test collaborative recommendations"""
        try:
            print("👥 Testing Collaborative Recommendations...")
            
            test_data = {
                "user_id": "test_user_123",
                "n_recommendations": 3
            }
            
            response = requests.post(
                f"{self.base_url}/recommendations/collaborative",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'recommendations' in data:
                    recs = data['recommendations']
                    # Cek bahwa tidak ada scoring yang bocor
                    for rec in recs:
                        if any(key.startswith('_') for key in rec.keys()):
                            print("❌ Collaborative: Scoring bocor ke user")
                            self.test_results.append(("Collaborative", "FAIL", "Scoring bocor ke user"))
                            return False
                    
                    print("✅ Collaborative recommendations berfungsi normal")
                    self.test_results.append(("Collaborative", "PASS", "Berfungsi normal"))
                    return True
                else:
                    print("❌ Collaborative response tidak valid")
                    self.test_results.append(("Collaborative", "FAIL", "Response tidak valid"))
                    return False
            else:
                print(f"❌ Collaborative gagal: {response.status_code}")
                self.test_results.append(("Collaborative", "FAIL", f"Status code: {response.status_code}"))
                return False
                
        except Exception as e:
            print(f"❌ Collaborative error: {str(e)}")
            self.test_results.append(("Collaborative", "FAIL", str(e)))
            return False
    
    def test_ai_enhanced_recommendations(self) -> bool:
        """Test AI-enhanced recommendations"""
        try:
            print("🤖 Testing AI-Enhanced Recommendations...")
            
            test_data = {
                "user_preferences": "Saya suka novel fiksi ilmiah dan teknologi",
                "n_recommendations": 3
            }
            
            response = requests.post(
                f"{self.base_url}/recommendations/ai-enhanced",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=60  # AI-enhanced butuh waktu lebih lama
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'recommendations' in data:
                    recs = data['recommendations']
                    # Cek bahwa tidak ada scoring yang bocor
                    for rec in recs:
                        if any(key.startswith('_') for key in rec.keys()):
                            print("❌ AI-Enhanced: Scoring bocor ke user")
                            self.test_results.append(("AI-Enhanced", "FAIL", "Scoring bocor ke user"))
                            return False
                    
                    print("✅ AI-enhanced recommendations berfungsi normal")
                    self.test_results.append(("AI-Enhanced", "PASS", "Berfungsi normal"))
                    return True
                else:
                    print("❌ AI-enhanced response tidak valid")
                    self.test_results.append(("AI-Enhanced", "FAIL", "Response tidak valid"))
                    return False
            else:
                print(f"❌ AI-enhanced gagal: {response.status_code}")
                self.test_results.append(("AI-Enhanced", "FAIL", f"Status code: {response.status_code}"))
                return False
                
        except Exception as e:
            print(f"❌ AI-enhanced error: {str(e)}")
            self.test_results.append(("AI-Enhanced", "FAIL", str(e)))
            return False
    
    def test_hybrid_recommendations(self) -> bool:
        """Test hybrid recommendations"""
        try:
            print("🎯 Testing Hybrid Recommendations...")
            
            test_data = {
                "user_id": "test_user_123",
                "book_id": "test_book_456",
                "user_preferences": "Saya suka novel fiksi ilmiah, teknologi, dan petualangan",
                "n_recommendations": 5
            }
            
            response = requests.post(
                f"{self.base_url}/recommendations/hybrid",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'recommendations' in data:
                    recommendations = data['recommendations']
                    
                    # Cek semua metode
                    for method, recs in recommendations.items():
                        for rec in recs:
                            if any(key.startswith('_') for key in rec.keys()):
                                print(f"❌ Hybrid {method}: Scoring bocor ke user")
                                self.test_results.append(("Hybrid", "FAIL", f"Scoring bocor di {method}"))
                                return False
                    
                    print("✅ Hybrid recommendations berfungsi normal")
                    self.test_results.append(("Hybrid", "PASS", "Berfungsi normal"))
                    return True
                else:
                    print("❌ Hybrid response tidak valid")
                    self.test_results.append(("Hybrid", "FAIL", "Response tidak valid"))
                    return False
            else:
                print(f"❌ Hybrid gagal: {response.status_code}")
                self.test_results.append(("Hybrid", "FAIL", f"Status code: {response.status_code}"))
                return False
                
        except Exception as e:
            print(f"❌ Hybrid error: {str(e)}")
            self.test_results.append(("Hybrid", "FAIL", str(e)))
            return False
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting"""
        try:
            print("⏱️  Testing Rate Limiting...")
            
            test_data = {
                "message": "Test message",
                "user_id": "rate_limit_test_user"
            }
            
            # Kirim multiple requests cepat
            responses = []
            for i in range(5):
                try:
                    response = requests.post(
                        f"{self.base_url}/ai/chat",
                        headers={"Content-Type": "application/json"},
                        json=test_data,
                        timeout=10
                    )
                    responses.append(response.status_code)
                except:
                    responses.append(500)
            
            # Cek apakah ada rate limiting
            if 429 in responses:
                print("✅ Rate limiting berfungsi")
                self.test_results.append(("Rate Limiting", "PASS", "Berfungsi normal"))
                return True
            else:
                print("⚠️  Rate limiting tidak terdeteksi")
                self.test_results.append(("Rate Limiting", "WARN", "Tidak terdeteksi"))
                return True  # Warning, bukan error
                
        except Exception as e:
            print(f"❌ Rate limiting test error: {str(e)}")
            self.test_results.append(("Rate Limiting", "FAIL", str(e)))
            return False
    
    def test_input_validation(self) -> bool:
        """Test input validation"""
        try:
            print("🔒 Testing Input Validation...")
            
            # Test dengan input berbahaya
            malicious_inputs = [
                {"message": "<script>alert('xss')</script>", "user_id": "test"},
                {"message": "normal message", "user_id": "../../../etc/passwd"},
                {"message": "a" * 2000, "user_id": "test"},  # Input terlalu panjang
            ]
            
            for i, test_input in enumerate(malicious_inputs, 1):
                try:
                    response = requests.post(
                        f"{self.base_url}/ai/chat",
                        headers={"Content-Type": "application/json"},
                        json=test_input,
                        timeout=10
                    )
                    
                    # Cek apakah input berbahaya ditolak atau disanitasi
                    if response.status_code == 400:
                        print(f"✅ Input validation {i}: Input berbahaya ditolak")
                    elif response.status_code == 200:
                        # Cek apakah response tidak mengandung script tags
                        data = response.json()
                        if '<script>' not in data.get('response', ''):
                            print(f"✅ Input validation {i}: Input berbahaya disanitasi")
                        else:
                            print(f"❌ Input validation {i}: XSS tidak disanitasi")
                            self.test_results.append(("Input Validation", "FAIL", f"XSS tidak disanitasi di test {i}"))
                            return False
                    else:
                        print(f"⚠️  Input validation {i}: Status code {response.status_code}")
                        
                except Exception as e:
                    print(f"⚠️  Input validation {i}: Error {str(e)}")
            
            print("✅ Input validation berfungsi normal")
            self.test_results.append(("Input Validation", "PASS", "Berfungsi normal"))
            return True
            
        except Exception as e:
            print(f"❌ Input validation error: {str(e)}")
            self.test_results.append(("Input Validation", "FAIL", str(e)))
            return False
    
    def run_all_tests(self):
        """Jalankan semua test"""
        print("🚀 AI SERVICES VALIDATOR")
        print("="*60)
        print(f"Testing AI Services at: {self.base_url}")
        print("="*60)
        
        tests = [
            self.test_health_endpoint,
            self.test_chat_endpoint,
            self.test_content_based_recommendations,
            self.test_collaborative_recommendations,
            self.test_ai_enhanced_recommendations,
            self.test_hybrid_recommendations,
            self.test_rate_limiting,
            self.test_input_validation
        ]
        
        passed = 0
        failed = 0
        warned = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ Test error: {str(e)}")
                failed += 1
            
            print()  # Spacing
        
        # Summary
        print("="*60)
        print("📊 VALIDATION SUMMARY")
        print("="*60)
        
        for test_name, status, message in self.test_results:
            status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
            print(f"{status_icon} {test_name}: {status} - {message}")
        
        print(f"\n📈 Results:")
        print(f"   ✅ Passed: {passed}")
        print(f"   ❌ Failed: {failed}")
        print(f"   ⚠️  Warnings: {warned}")
        
        if failed == 0:
            print("\n🎉 SEMUA TEST BERHASIL! AI Services berjalan lancar tanpa bug.")
        else:
            print(f"\n⚠️  {failed} test gagal. Periksa dan perbaiki masalah yang ditemukan.")
        
        return failed == 0

def main():
    """Main function"""
    import sys
    
    base_url = "http://localhost:5001"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    validator = AIServicesValidator(base_url)
    success = validator.run_all_tests()
    
    if success:
        print("\n💡 Tips untuk production:")
        print("   - Pastikan MongoDB berjalan")
        print("   - Set environment variables dengan benar")
        print("   - Monitor logs secara berkala")
        print("   - Backup database secara rutin")
    else:
        print("\n🔧 Langkah troubleshooting:")
        print("   - Periksa koneksi MongoDB")
        print("   - Cek environment variables")
        print("   - Periksa logs di folder logs/")
        print("   - Restart AI services jika diperlukan")

if __name__ == '__main__':
    main() 