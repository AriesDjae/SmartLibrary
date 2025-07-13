#!/usr/bin/env python3
"""
Script untuk test sistem prompt dan negative prompt AI
"""

import requests
import json
import time
from typing import Dict, Any, List

class AIPromptTester:
    """Tester untuk AI prompts"""
    
    def __init__(self, base_url: str = "http://localhost:5001"):
        """Inisialisasi tester"""
        self.base_url = base_url
        self.test_cases = [
            {
                "name": "Test 1: Sambutan dan Analisis Preferensi",
                "message": "Halo, saya suka novel fiksi ilmiah",
                "user_id": "test_user_1",
                "expected_elements": ["sambutan", "analisis", "fiksi ilmiah", "emoji"]
            },
            {
                "name": "Test 2: Rekomendasi dengan Konteks Buku",
                "message": "Saya sedang membaca novel tentang teknologi masa depan",
                "user_id": "test_user_2",
                "book_id": "book_tech_001",
                "expected_elements": ["konteks", "rekomendasi", "teknologi", "masa depan"]
            },
            {
                "name": "Test 3: Pertanyaan Spesifik Genre",
                "message": "Bisakah Anda merekomendasikan novel fantasi yang bagus?",
                "user_id": "test_user_3",
                "expected_elements": ["fantasi", "rekomendasi", "penjelasan", "tips"]
            },
            {
                "name": "Test 4: Preferensi Kompleks",
                "message": "Saya suka novel yang menggabungkan fiksi ilmiah dengan elemen misteri dan memiliki karakter yang kuat",
                "user_id": "test_user_4",
                "expected_elements": ["fiksi ilmiah", "misteri", "karakter", "analisis mendalam"]
            },
            {
                "name": "Test 5: Pertanyaan tentang Penulis",
                "message": "Siapa penulis fiksi ilmiah yang bagus untuk pemula?",
                "user_id": "test_user_5",
                "expected_elements": ["penulis", "pemula", "rekomendasi", "penjelasan"]
            },
            {
                "name": "Test 6: Mood Reading",
                "message": "Saya sedang sedih, butuh buku yang menghibur",
                "user_id": "test_user_6",
                "expected_elements": ["mood", "menghibur", "empati", "rekomendasi"]
            },
            {
                "name": "Test 7: Pertanyaan Teknis",
                "message": "Bagaimana algoritma rekomendasi bekerja?",
                "user_id": "test_user_7",
                "expected_elements": ["algoritma", "penjelasan", "sederhana", "user-friendly"]
            }
        ]
    
    def test_health(self) -> bool:
        """Test health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Health check berhasil")
                return True
            else:
                print(f"❌ Health check gagal: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error health check: {str(e)}")
            return False
    
    def test_ai_response_quality(self, test_case: Dict[str, Any]) -> bool:
        """Test kualitas respons AI"""
        try:
            print(f"\n🧪 {test_case['name']}")
            print("-" * 60)
            
            # Log request
            print(f"📤 Request:")
            print(f"   Message: {test_case['message']}")
            print(f"   User ID: {test_case['user_id']}")
            if 'book_id' in test_case:
                print(f"   Book ID: {test_case['book_id']}")
            
            # Send request
            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/ai/chat",
                headers={"Content-Type": "application/json"},
                json={
                    "message": test_case['message'],
                    "user_id": test_case['user_id'],
                    "book_id": test_case.get('book_id')
                },
                timeout=60
            )
            end_time = time.time()
            
            # Log response
            print(f"\n📥 Response (Status: {response.status_code})")
            print(f"⏱️  Response Time: {end_time - start_time:.3f}s")
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data.get('response', '')
                
                print(f"\n🤖 AI Response Preview:")
                print(f"   Length: {len(ai_response)} characters")
                print(f"   Preview: {ai_response[:200]}...")
                
                # Analisis kualitas respons
                quality_score = self._analyze_response_quality(ai_response, test_case['expected_elements'])
                
                print(f"\n📊 Quality Analysis:")
                print(f"   Score: {quality_score}/100")
                print(f"   Elements Found: {self._check_expected_elements(ai_response, test_case['expected_elements'])}")
                
                # Cek negative prompt compliance
                negative_compliance = self._check_negative_prompt_compliance(ai_response)
                print(f"   Negative Prompt Compliance: {'✅' if negative_compliance else '❌'}")
                
                if quality_score >= 70 and negative_compliance:
                    print("✅ Test berhasil - Respons berkualitas tinggi")
                    return True
                else:
                    print("⚠️  Test perlu perbaikan - Respons kurang optimal")
                    return False
            else:
                print(f"❌ Test gagal: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error test: {str(e)}")
            return False
    
    def _analyze_response_quality(self, response: str, expected_elements: List[str]) -> int:
        """Analisis kualitas respons"""
        score = 0
        
        # Cek panjang respons (10 points)
        if 100 <= len(response) <= 1000:
            score += 10
        elif len(response) > 1000:
            score += 5
        
        # Cek bahasa Indonesia (20 points)
        indonesian_words = ['yang', 'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'oleh']
        indonesian_count = sum(1 for word in indonesian_words if word in response.lower())
        if indonesian_count >= 5:
            score += 20
        elif indonesian_count >= 3:
            score += 10
        
        # Cek expected elements (40 points)
        found_elements = self._check_expected_elements(response, expected_elements)
        element_score = (len(found_elements) / len(expected_elements)) * 40
        score += element_score
        
        # Cek emoji usage (10 points)
        emoji_count = sum(1 for char in response if ord(char) > 127)
        if 2 <= emoji_count <= 10:
            score += 10
        elif emoji_count > 10:
            score += 5
        
        # Cek struktur respons (20 points)
        if any(phrase in response.lower() for phrase in ['rekomendasi', 'saran', 'tips']):
            score += 10
        if any(phrase in response.lower() for phrase in ['bertanya', 'tanya', 'lanjut', 'lain']):
            score += 10
        
        return min(100, int(score))
    
    def _check_expected_elements(self, response: str, expected_elements: List[str]) -> List[str]:
        """Cek elemen yang diharapkan dalam respons"""
        found_elements = []
        response_lower = response.lower()
        
        for element in expected_elements:
            if element.lower() in response_lower:
                found_elements.append(element)
        
        return found_elements
    
    def _check_negative_prompt_compliance(self, response: str) -> bool:
        """Cek compliance dengan negative prompt"""
        response_lower = response.lower()
        
        # Cek hal yang tidak boleh ada
        negative_indicators = [
            'spoiler',
            'formal',
            'kaku',
            'tidak sopan',
            'tidak profesional',
            'terlalu pendek',
            'generik',
            'emoji berlebihan'
        ]
        
        # Cek apakah respons dalam bahasa Indonesia
        indonesian_indicators = [
            'yang', 'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'oleh',
            'buku', 'novel', 'cerita', 'penulis', 'genre', 'rekomendasi'
        ]
        
        has_indonesian = sum(1 for word in indonesian_indicators if word in response_lower) >= 3
        
        # Cek apakah ada ajakan untuk bertanya lebih lanjut
        has_engagement = any(phrase in response_lower for phrase in ['bertanya', 'tanya', 'lanjut', 'lain', '?'])
        
        return has_indonesian and has_engagement
    
    def test_prompt_variations(self):
        """Test variasi prompt untuk melihat konsistensi"""
        print(f"\n🔄 PROMPT VARIATION TEST")
        print("="*60)
        
        base_message = "Saya suka novel fiksi ilmiah"
        variations = [
            "Saya suka novel fiksi ilmiah",
            "Saya menyukai buku fiksi ilmiah",
            "Novel fiksi ilmiah adalah favorit saya",
            "Saya tertarik dengan fiksi ilmiah",
            "Buku fiksi ilmiah sangat menarik bagi saya"
        ]
        
        responses = []
        for i, variation in enumerate(variations, 1):
            try:
                response = requests.post(
                    f"{self.base_url}/ai/chat",
                    headers={"Content-Type": "application/json"},
                    json={
                        "message": variation,
                        "user_id": f"variation_test_{i}"
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get('response', '')
                    responses.append(ai_response)
                    print(f"   Variation {i}: {len(ai_response)} chars ✅")
                else:
                    print(f"   Variation {i}: FAILED ❌")
                
                time.sleep(1)  # Delay between requests
                
            except Exception as e:
                print(f"   Variation {i}: ERROR ❌ - {str(e)}")
        
        # Analisis konsistensi
        if len(responses) >= 3:
            print(f"\n📊 Consistency Analysis:")
            print(f"   Total Variations: {len(variations)}")
            print(f"   Successful Responses: {len(responses)}")
            
            # Cek apakah semua respons mengandung elemen yang sama
            common_elements = ['fiksi ilmiah', 'rekomendasi', 'buku']
            consistency_score = 0
            
            for element in common_elements:
                element_count = sum(1 for resp in responses if element.lower() in resp.lower())
                if element_count == len(responses):
                    consistency_score += 33
            
            print(f"   Consistency Score: {consistency_score:.1f}%")
            
            if consistency_score >= 66:
                print("   ✅ Konsistensi respons baik")
            else:
                print("   ⚠️  Konsistensi respons perlu diperbaiki")
    
    def run_all_tests(self):
        """Jalankan semua test"""
        print("🚀 AI PROMPT TESTER")
        print("="*60)
        print(f"Testing AI Prompts at: {self.base_url}")
        print("="*60)
        
        # Test health first
        if not self.test_health():
            print("❌ Health check gagal, berhenti testing")
            return
        
        print(f"\n📋 Menjalankan {len(self.test_cases)} test cases...")
        
        success_count = 0
        for i, test_case in enumerate(self.test_cases, 1):
            print(f"\n{'='*60}")
            print(f"TEST {i}/{len(self.test_cases)}")
            print('='*60)
            
            if self.test_ai_response_quality(test_case):
                success_count += 1
            
            # Delay between tests
            if i < len(self.test_cases):
                print("\n⏳ Menunggu 3 detik sebelum test berikutnya...")
                time.sleep(3)
        
        # Test prompt variations
        self.test_prompt_variations()
        
        # Summary
        print(f"\n{'='*60}")
        print("📊 TEST SUMMARY")
        print('='*60)
        print(f"✅ Berhasil: {success_count}/{len(self.test_cases)}")
        print(f"❌ Gagal: {len(self.test_cases) - success_count}/{len(self.test_cases)}")
        
        if success_count == len(self.test_cases):
            print("🎉 Semua test berhasil! AI prompts berfungsi dengan baik.")
            print("\n💡 Tips untuk production:")
            print("   - Monitor kualitas respons secara berkala")
            print("   - Update prompt berdasarkan feedback user")
            print("   - Test dengan berbagai jenis pertanyaan")
        else:
            print("⚠️  Beberapa test gagal. Periksa dan perbaiki prompt.")
    
    def test_specific_scenarios(self):
        """Test skenario spesifik"""
        print(f"\n🎯 SPECIFIC SCENARIO TEST")
        print("="*60)
        
        scenarios = [
            {
                "name": "User Baru (Cold Start)",
                "message": "Halo, ini pertama kali saya menggunakan sistem ini",
                "user_id": "new_user_001"
            },
            {
                "name": "User dengan Preferensi Kompleks",
                "message": "Saya suka novel yang menggabungkan fiksi ilmiah, misteri, dan memiliki karakter perempuan yang kuat",
                "user_id": "complex_user_001"
            },
            {
                "name": "User yang Bingung",
                "message": "Saya tidak tahu mau baca apa, tolong bantu saya",
                "user_id": "confused_user_001"
            },
            {
                "name": "User yang Spesifik",
                "message": "Saya mencari novel yang mirip dengan Dune karya Frank Herbert",
                "user_id": "specific_user_001"
            }
        ]
        
        for scenario in scenarios:
            try:
                print(f"\n🧪 {scenario['name']}")
                print("-" * 40)
                
                response = requests.post(
                    f"{self.base_url}/ai/chat",
                    headers={"Content-Type": "application/json"},
                    json={
                        "message": scenario['message'],
                        "user_id": scenario['user_id']
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data.get('response', '')
                    
                    print(f"   Response Length: {len(ai_response)} chars")
                    print(f"   Preview: {ai_response[:150]}...")
                    
                    # Cek apakah respons sesuai dengan skenario
                    if scenario['name'] == "User Baru (Cold Start)":
                        if any(word in ai_response.lower() for word in ['selamat datang', 'pertama kali', 'kenalan']):
                            print("   ✅ Respons sesuai untuk user baru")
                        else:
                            print("   ⚠️  Respons kurang personal untuk user baru")
                    
                    elif scenario['name'] == "User dengan Preferensi Kompleks":
                        if any(word in ai_response.lower() for word in ['kompleks', 'beragam', 'gabungan']):
                            print("   ✅ Respons mengakui preferensi kompleks")
                        else:
                            print("   ⚠️  Respons tidak mengakui kompleksitas preferensi")
                    
                    elif scenario['name'] == "User yang Bingung":
                        if any(word in ai_response.lower() for word in ['bantu', 'tanya', 'jelaskan', 'mulai']):
                            print("   ✅ Respons membantu user yang bingung")
                        else:
                            print("   ⚠️  Respons kurang membantu")
                    
                    elif scenario['name'] == "User yang Spesifik":
                        if any(word in ai_response.lower() for word in ['dune', 'frank herbert', 'serupa', 'mirip']):
                            print("   ✅ Respons mengakui referensi spesifik")
                        else:
                            print("   ⚠️  Respons tidak mengakui referensi")
                
                else:
                    print(f"   ❌ Failed: {response.status_code}")
                
                time.sleep(2)
                
            except Exception as e:
                print(f"   ❌ Error: {str(e)}")

def main():
    """Main function"""
    import sys
    
    base_url = "http://localhost:5001"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    tester = AIPromptTester(base_url)
    
    print("Pilih test mode:")
    print("1. 🧪 Run All Tests")
    print("2. 🎯 Specific Scenarios")
    print("3. 🔄 Run All + Scenarios")
    
    choice = input("\nPilihan (1-3): ")
    
    if choice == "1":
        tester.run_all_tests()
    elif choice == "2":
        tester.test_specific_scenarios()
    elif choice == "3":
        tester.run_all_tests()
        tester.test_specific_scenarios()
    else:
        print("❌ Pilihan tidak valid!")

if __name__ == '__main__':
    main() 