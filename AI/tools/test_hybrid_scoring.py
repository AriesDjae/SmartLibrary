#!/usr/bin/env python3
"""
Script untuk test hybrid scoring dan menghasilkan log
"""

import requests
import json
import time
from typing import Dict, Any

class HybridScoringTester:
    """Tester untuk hybrid scoring"""
    
    def __init__(self, base_url: str = "http://localhost:5001"):
        """Inisialisasi tester"""
        self.base_url = base_url
        self.test_cases = [
            {
                "name": "Test 1: Content-Based Only",
                "data": {
                    "book_id": "book123",
                    "n_recommendations": 3
                }
            },
            {
                "name": "Test 2: Collaborative Only",
                "data": {
                    "user_id": "user123",
                    "n_recommendations": 3
                }
            },
            {
                "name": "Test 3: AI-Enhanced Only",
                "data": {
                    "user_preferences": "Saya suka novel fiksi ilmiah dan teknologi",
                    "n_recommendations": 3
                }
            },
            {
                "name": "Test 4: Hybrid Complete",
                "data": {
                    "user_id": "user123",
                    "book_id": "book456",
                    "user_preferences": "Saya suka novel fiksi ilmiah, teknologi, dan petualangan",
                    "n_recommendations": 5
                }
            },
            {
                "name": "Test 5: Hybrid with Long Preferences",
                "data": {
                    "user_id": "user456",
                    "book_id": "book789",
                    "user_preferences": "Saya sangat menyukai novel-novel yang berkaitan dengan teknologi masa depan, fiksi ilmiah yang mengeksplorasi kemungkinan-kemungkinan baru dalam sains, dan cerita petualangan yang menggabungkan elemen fantasi dengan realitas modern",
                    "n_recommendations": 4
                }
            }
        ]
    
    def test_health(self) -> bool:
        """Test health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ Health check berhasil")
                return True
            else:
                print(f"❌ Health check gagal: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error health check: {str(e)}")
            return False
    
    def test_hybrid_recommendation(self, test_case: Dict[str, Any]) -> bool:
        """Test hybrid recommendation endpoint"""
        try:
            print(f"\n🧪 {test_case['name']}")
            print("-" * 50)
            
            # Log request
            print(f"📤 Request:")
            for key, value in test_case['data'].items():
                if key == 'user_preferences' and len(str(value)) > 50:
                    print(f"   {key}: {str(value)[:50]}...")
                else:
                    print(f"   {key}: {value}")
            
            # Send request
            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/recommendations/hybrid",
                headers={"Content-Type": "application/json"},
                json=test_case['data']
            )
            end_time = time.time()
            
            # Log response
            print(f"\n📥 Response (Status: {response.status_code})")
            print(f"⏱️  Response Time: {end_time - start_time:.3f}s")
            
            if response.status_code == 200:
                data = response.json()
                recommendations = data.get('recommendations', {})
                
                # Log summary
                total_recs = sum(len(recs) for recs in recommendations.values())
                print(f"📊 Total Recommendations: {total_recs}")
                
                # Log each method
                for method, recs in recommendations.items():
                    if recs:
                        method_name = {
                            'content_based': '📊 Content-Based',
                            'collaborative': '👥 Collaborative',
                            'ai_enhanced': '🤖 AI-Enhanced'
                        }.get(method, method)
                        
                        print(f"\n{method_name} ({len(recs)} recommendations):")
                        for i, rec in enumerate(recs, 1):
                            title = rec.get('title', 'N/A')
                            author = rec.get('author', 'N/A')
                            
                            # Tampilkan hanya informasi yang aman untuk user
                            print(f"   {i}. {title} oleh {author}")
                            # Log scoring hanya untuk developer (tidak ditampilkan ke user)
                            if method == 'content_based' and '_internal_similarity_score' in rec:
                                print(f"      [DEV] Internal Score: {rec['_internal_similarity_score']:.4f}")
                            elif method == 'collaborative' and '_internal_predicted_rating' in rec:
                                print(f"      [DEV] Internal Rating: {rec['_internal_predicted_rating']:.2f}")
                            elif method == 'ai_enhanced' and '_internal_relevance_score' in rec:
                                print(f"      [DEV] Internal Relevance: {rec['_internal_relevance_score']:.4f}")
                                if '_internal_keywords' in rec:
                                    print(f"      [DEV] Keywords: {', '.join(rec['_internal_keywords'])}")
                
                print(f"\n✅ Test berhasil")
                return True
            else:
                print(f"❌ Test gagal: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error test: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Jalankan semua test"""
        print("🚀 HYBRID SCORING TESTER")
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
            
            if self.test_hybrid_recommendation(test_case):
                success_count += 1
            
            # Delay between tests
            if i < len(self.test_cases):
                print("\n⏳ Menunggu 2 detik sebelum test berikutnya...")
                time.sleep(2)
        
        # Summary
        print(f"\n{'='*60}")
        print("📊 TEST SUMMARY")
        print('='*60)
        print(f"✅ Berhasil: {success_count}/{len(self.test_cases)}")
        print(f"❌ Gagal: {len(self.test_cases) - success_count}/{len(self.test_cases)}")
        
        if success_count == len(self.test_cases):
            print("🎉 Semua test berhasil! Log scoring hybrid telah dihasilkan.")
            print("\n💡 Untuk melihat log scoring, jalankan:")
            print("   cd AI/tools")
            print("   python view_hybrid_scoring_logs.py")
        else:
            print("⚠️  Beberapa test gagal. Periksa log untuk detail.")
    
    def test_performance(self, iterations: int = 5):
        """Test performance dengan multiple iterations"""
        print(f"\n⚡ PERFORMANCE TEST ({iterations} iterations)")
        print("="*60)
        
        test_data = {
            "user_id": "user123",
            "book_id": "book456",
            "user_preferences": "Saya suka novel fiksi ilmiah",
            "n_recommendations": 5
        }
        
        times = []
        success_count = 0
        
        for i in range(iterations):
            try:
                start_time = time.time()
                response = requests.post(
                    f"{self.base_url}/recommendations/hybrid",
                    headers={"Content-Type": "application/json"},
                    json=test_data
                )
                end_time = time.time()
                
                if response.status_code == 200:
                    times.append(end_time - start_time)
                    success_count += 1
                    print(f"   Iteration {i+1}: {end_time - start_time:.3f}s ✅")
                else:
                    print(f"   Iteration {i+1}: FAILED ❌")
                
                # Small delay
                time.sleep(0.5)
                
            except Exception as e:
                print(f"   Iteration {i+1}: ERROR ❌ - {str(e)}")
        
        if times:
            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)
            
            print(f"\n📊 Performance Results:")
            print(f"   Success Rate: {success_count}/{iterations} ({success_count/iterations*100:.1f}%)")
            print(f"   Average Time: {avg_time:.3f}s")
            print(f"   Min Time: {min_time:.3f}s")
            print(f"   Max Time: {max_time:.3f}s")
            
            if avg_time < 1.0:
                print("   🚀 Performance: EXCELLENT")
            elif avg_time < 3.0:
                print("   ⚡ Performance: GOOD")
            elif avg_time < 5.0:
                print("   ⚠️  Performance: ACCEPTABLE")
            else:
                print("   🐌 Performance: SLOW")

def main():
    """Main function"""
    import sys
    
    # Check if AI service is running
    base_url = "http://localhost:5001"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    tester = HybridScoringTester(base_url)
    
    print("Pilih test mode:")
    print("1. 🧪 Run All Tests")
    print("2. ⚡ Performance Test")
    print("3. 🔄 Run All + Performance")
    
    choice = input("\nPilihan (1-3): ")
    
    if choice == "1":
        tester.run_all_tests()
    elif choice == "2":
        iterations = int(input("Jumlah iterations (default 5): ") or "5")
        tester.test_performance(iterations)
    elif choice == "3":
        tester.run_all_tests()
        tester.test_performance(5)
    else:
        print("❌ Pilihan tidak valid!")

if __name__ == '__main__':
    main() 