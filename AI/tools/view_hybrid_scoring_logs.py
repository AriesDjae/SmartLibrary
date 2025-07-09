#!/usr/bin/env python3
"""
Script untuk melihat log scoring hybrid recommendation
"""

import os
import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any

class HybridScoringLogViewer:
    """Viewer untuk log scoring hybrid recommendation"""
    
    def __init__(self):
        """Inisialisasi viewer"""
        self.logs_dir = "logs"
        self.log_pattern = r"ai_services_\d{8}\.log"
        
    def get_log_files(self) -> List[str]:
        """Dapatkan daftar file log"""
        if not os.path.exists(self.logs_dir):
            print(f"❌ Direktori {self.logs_dir} tidak ditemukan")
            return []
        
        log_files = []
        for file in os.listdir(self.logs_dir):
            if re.match(self.log_pattern, file):
                log_files.append(os.path.join(self.logs_dir, file))
        
        return sorted(log_files, reverse=True)  # Terbaru dulu
    
    def parse_hybrid_logs(self, log_file: str, filter_type: str = "all") -> List[Dict[str, Any]]:
        """Parse log untuk hybrid recommendation"""
        hybrid_logs = []
        
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            current_request = None
            
            for line in lines:
                line = line.strip()
                
                # Deteksi awal request hybrid
                if "🔍 HYBRID RECOMMENDATION REQUEST" in line:
                    current_request = {
                        'timestamp': self._extract_timestamp(line),
                        'request': {},
                        'content_based': [],
                        'collaborative': [],
                        'ai_enhanced': [],
                        'summary': {},
                        'total_time': 0
                    }
                
                # Parse request details
                elif current_request and "User ID:" in line:
                    current_request['request']['user_id'] = line.split("User ID:")[1].strip()
                elif current_request and "Book ID:" in line:
                    current_request['request']['book_id'] = line.split("Book ID:")[1].strip()
                elif current_request and "User Preferences:" in line:
                    current_request['request']['user_preferences'] = line.split("User Preferences:")[1].strip()
                elif current_request and "N Recommendations:" in line:
                    current_request['request']['n_recommendations'] = int(line.split("N Recommendations:")[1].strip())
                
                # Parse content-based recommendations
                elif current_request and "📊 CONTENT-BASED:" in line:
                    current_request['content_based'].append({
                        'type': 'content_based',
                        'message': line
                    })
                elif current_request and "Content-Based:" in line and "recommendations in" in line:
                    # Extract score info
                    score_match = re.search(r'(\d+\.\d+)s', line)
                    if score_match:
                        current_request['content_based'].append({
                            'type': 'performance',
                            'time': float(score_match.group(1))
                        })
                elif current_request and "Score:" in line and "content_based" in current_request.get('current_method', ''):
                    # Extract individual book scores
                    score_match = re.search(r'Score: ([\d.]+)', line)
                    title_match = re.search(r'(\d+)\. (.+?) - Score:', line)
                    if score_match and title_match:
                        current_request['content_based'].append({
                            'type': 'book_score',
                            'rank': int(title_match.group(1)),
                            'title': title_match.group(2),
                            'score': float(score_match.group(1))
                        })
                
                # Parse collaborative recommendations
                elif current_request and "👥 COLLABORATIVE:" in line:
                    current_request['collaborative'].append({
                        'type': 'collaborative',
                        'message': line
                    })
                elif current_request and "Collaborative:" in line and "recommendations in" in line:
                    score_match = re.search(r'(\d+\.\d+)s', line)
                    if score_match:
                        current_request['collaborative'].append({
                            'type': 'performance',
                            'time': float(score_match.group(1))
                        })
                elif current_request and "Predicted Rating:" in line:
                    rating_match = re.search(r'Predicted Rating: ([\d.]+)', line)
                    title_match = re.search(r'(\d+)\. (.+?) - Predicted Rating:', line)
                    if rating_match and title_match:
                        current_request['collaborative'].append({
                            'type': 'book_rating',
                            'rank': int(title_match.group(1)),
                            'title': title_match.group(2),
                            'rating': float(rating_match.group(1))
                        })
                
                # Parse AI-enhanced recommendations
                elif current_request and "🤖 AI-ENHANCED:" in line:
                    current_request['ai_enhanced'].append({
                        'type': 'ai_enhanced',
                        'message': line
                    })
                elif current_request and "AI-Enhanced:" in line and "recommendations in" in line:
                    score_match = re.search(r'(\d+\.\d+)s', line)
                    if score_match:
                        current_request['ai_enhanced'].append({
                            'type': 'performance',
                            'time': float(score_match.group(1))
                        })
                elif current_request and "Relevance:" in line:
                    relevance_match = re.search(r'Relevance: ([\d.]+)', line)
                    title_match = re.search(r'(\d+)\. (.+?) - Relevance:', line)
                    if relevance_match and title_match:
                        current_request['ai_enhanced'].append({
                            'type': 'book_relevance',
                            'rank': int(title_match.group(1)),
                            'title': title_match.group(2),
                            'relevance': float(relevance_match.group(1))
                        })
                
                # Parse summary
                elif current_request and "🎯 HYBRID RECOMMENDATION SUMMARY" in line:
                    current_request['summary']['type'] = 'summary'
                elif current_request and "Total Recommendations:" in line:
                    total_match = re.search(r'Total Recommendations: (\d+)', line)
                    if total_match:
                        current_request['summary']['total_recommendations'] = int(total_match.group(1))
                elif current_request and "Total Time:" in line:
                    time_match = re.search(r'Total Time: ([\d.]+)s', line)
                    if time_match:
                        current_request['total_time'] = float(time_match.group(1))
                        # End of request, add to logs
                        if filter_type == "all" or self._matches_filter(current_request, filter_type):
                            hybrid_logs.append(current_request)
                        current_request = None
        
        except Exception as e:
            print(f"❌ Error parsing log file {log_file}: {str(e)}")
        
        return hybrid_logs
    
    def _extract_timestamp(self, line: str) -> str:
        """Extract timestamp dari log line"""
        timestamp_match = re.search(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', line)
        return timestamp_match.group(1) if timestamp_match else "Unknown"
    
    def _matches_filter(self, request: Dict[str, Any], filter_type: str) -> bool:
        """Cek apakah request matches filter"""
        if filter_type == "all":
            return True
        elif filter_type == "content_based" and request['content_based']:
            return True
        elif filter_type == "collaborative" and request['collaborative']:
            return True
        elif filter_type == "ai_enhanced" and request['ai_enhanced']:
            return True
        return False
    
    def show_main_menu(self):
        """Tampilkan menu utama"""
        print("\n" + "="*60)
        print("📊 HYBRID SCORING LOG VIEWER")
        print("="*60)
        print("1. 📋 Lihat Semua Log Hybrid")
        print("2. 📊 Lihat Log Content-Based")
        print("3. 👥 Lihat Log Collaborative")
        print("4. 🤖 Lihat Log AI-Enhanced")
        print("5. ⏱️  Analisis Performance")
        print("6. 🎯 Analisis Scoring Patterns")
        print("7. 📈 Statistik Log")
        print("0. 🚪 Keluar")
        print("="*60)
    
    def show_all_logs(self, logs: List[Dict[str, Any]]):
        """Tampilkan semua log hybrid"""
        if not logs:
            print("❌ Tidak ada log hybrid yang ditemukan")
            return
        
        print(f"\n📋 SEMUA LOG HYBRID ({len(logs)} requests)")
        print("="*80)
        
        for i, log in enumerate(logs, 1):
            print(f"\n🔍 REQUEST {i}")
            print("-" * 40)
            print(f"Timestamp: {log['timestamp']}")
            print(f"User ID: {log['request'].get('user_id', 'None')}")
            print(f"Book ID: {log['request'].get('book_id', 'None')}")
            print(f"N Recommendations: {log['request'].get('n_recommendations', 0)}")
            print(f"Total Time: {log['total_time']:.3f}s")
            
            # Summary
            if 'summary' in log and 'total_recommendations' in log['summary']:
                print(f"Total Recommendations: {log['summary']['total_recommendations']}")
            
            # Show top scores from each method
            self._show_top_scores(log)
    
    def _show_top_scores(self, log: Dict[str, Any]):
        """Tampilkan top scores dari setiap metode"""
        print("\n🏆 TOP SCORES:")
        
        # Content-based top scores
        content_scores = [item for item in log['content_based'] if item['type'] == 'book_score']
        if content_scores:
            print("   📊 Content-Based:")
            for score in sorted(content_scores, key=lambda x: x['score'], reverse=True)[:3]:
                print(f"      {score['rank']}. {score['title']} - Score: {score['score']:.4f}")
        
        # Collaborative top ratings
        collab_ratings = [item for item in log['collaborative'] if item['type'] == 'book_rating']
        if collab_ratings:
            print("   👥 Collaborative:")
            for rating in sorted(collab_ratings, key=lambda x: x['rating'], reverse=True)[:3]:
                print(f"      {rating['rank']}. {rating['title']} - Rating: {rating['rating']:.2f}")
        
        # AI-enhanced top relevance
        ai_relevance = [item for item in log['ai_enhanced'] if item['type'] == 'book_relevance']
        if ai_relevance:
            print("   🤖 AI-Enhanced:")
            for rel in sorted(ai_relevance, key=lambda x: x['relevance'], reverse=True)[:3]:
                print(f"      {rel['rank']}. {rel['title']} - Relevance: {rel['relevance']:.4f}")
    
    def analyze_performance(self, logs: List[Dict[str, Any]]):
        """Analisis performance dari logs"""
        if not logs:
            print("❌ Tidak ada log untuk dianalisis")
            return
        
        print(f"\n⏱️  PERFORMANCE ANALYSIS ({len(logs)} requests)")
        print("="*60)
        
        # Calculate performance metrics
        total_times = [log['total_time'] for log in logs if log['total_time'] > 0]
        content_times = []
        collab_times = []
        ai_times = []
        
        for log in logs:
            for item in log['content_based']:
                if item['type'] == 'performance':
                    content_times.append(item['time'])
            for item in log['collaborative']:
                if item['type'] == 'performance':
                    collab_times.append(item['time'])
            for item in log['ai_enhanced']:
                if item['type'] == 'performance':
                    ai_times.append(item['time'])
        
        print(f"📊 Total Requests: {len(logs)}")
        print(f"⏱️  Average Total Time: {sum(total_times)/len(total_times):.3f}s")
        print(f"📈 Min Total Time: {min(total_times):.3f}s")
        print(f"📉 Max Total Time: {max(total_times):.3f}s")
        
        if content_times:
            print(f"\n📊 Content-Based Performance:")
            print(f"   Average: {sum(content_times)/len(content_times):.3f}s")
            print(f"   Min: {min(content_times):.3f}s")
            print(f"   Max: {max(content_times):.3f}s")
        
        if collab_times:
            print(f"\n👥 Collaborative Performance:")
            print(f"   Average: {sum(collab_times)/len(collab_times):.3f}s")
            print(f"   Min: {min(collab_times):.3f}s")
            print(f"   Max: {max(collab_times):.3f}s")
        
        if ai_times:
            print(f"\n🤖 AI-Enhanced Performance:")
            print(f"   Average: {sum(ai_times)/len(ai_times):.3f}s")
            print(f"   Min: {min(ai_times):.3f}s")
            print(f"   Max: {max(ai_times):.3f}s")
    
    def analyze_scoring_patterns(self, logs: List[Dict[str, Any]]):
        """Analisis pola scoring"""
        if not logs:
            print("❌ Tidak ada log untuk dianalisis")
            return
        
        print(f"\n🎯 SCORING PATTERNS ANALYSIS ({len(logs)} requests)")
        print("="*60)
        
        # Collect all scores
        content_scores = []
        collab_ratings = []
        ai_relevance = []
        
        for log in logs:
            for item in log['content_based']:
                if item['type'] == 'book_score':
                    content_scores.append(item['score'])
            for item in log['collaborative']:
                if item['type'] == 'book_rating':
                    collab_ratings.append(item['rating'])
            for item in log['ai_enhanced']:
                if item['type'] == 'book_relevance':
                    ai_relevance.append(item['relevance'])
        
        if content_scores:
            print(f"📊 Content-Based Scores ({len(content_scores)} scores):")
            print(f"   Average: {sum(content_scores)/len(content_scores):.4f}")
            print(f"   Min: {min(content_scores):.4f}")
            print(f"   Max: {max(content_scores):.4f}")
            print(f"   Range: {max(content_scores) - min(content_scores):.4f}")
        
        if collab_ratings:
            print(f"\n👥 Collaborative Ratings ({len(collab_ratings)} ratings):")
            print(f"   Average: {sum(collab_ratings)/len(collab_ratings):.2f}")
            print(f"   Min: {min(collab_ratings):.2f}")
            print(f"   Max: {max(collab_ratings):.2f}")
            print(f"   Range: {max(collab_ratings) - min(collab_ratings):.2f}")
        
        if ai_relevance:
            print(f"\n🤖 AI-Enhanced Relevance ({len(ai_relevance)} scores):")
            print(f"   Average: {sum(ai_relevance)/len(ai_relevance):.4f}")
            print(f"   Min: {min(ai_relevance):.4f}")
            print(f"   Max: {max(ai_relevance):.4f}")
            print(f"   Range: {max(ai_relevance) - min(ai_relevance):.4f}")
    
    def show_log_statistics(self, logs: List[Dict[str, Any]]):
        """Tampilkan statistik log"""
        if not logs:
            print("❌ Tidak ada log untuk dianalisis")
            return
        
        print(f"\n📈 LOG STATISTICS ({len(logs)} requests)")
        print("="*60)
        
        # Count methods used
        content_count = sum(1 for log in logs if log['content_based'])
        collab_count = sum(1 for log in logs if log['collaborative'])
        ai_count = sum(1 for log in logs if log['ai_enhanced'])
        
        print(f"📊 Content-Based Used: {content_count} times ({content_count/len(logs)*100:.1f}%)")
        print(f"👥 Collaborative Used: {collab_count} times ({collab_count/len(logs)*100:.1f}%)")
        print(f"🤖 AI-Enhanced Used: {ai_count} times ({ai_count/len(logs)*100:.1f}%)")
        
        # Time distribution
        total_times = [log['total_time'] for log in logs if log['total_time'] > 0]
        if total_times:
            print(f"\n⏱️  Time Distribution:")
            print(f"   Fast (< 1s): {sum(1 for t in total_times if t < 1)} requests")
            print(f"   Medium (1-5s): {sum(1 for t in total_times if 1 <= t < 5)} requests")
            print(f"   Slow (> 5s): {sum(1 for t in total_times if t >= 5)} requests")
    
    def run(self):
        """Jalankan viewer"""
        print("📊 HYBRID SCORING LOG VIEWER")
        print("Memulai aplikasi...")
        
        # Get log files
        log_files = self.get_log_files()
        if not log_files:
            print("❌ Tidak ada file log yang ditemukan")
            return
        
        print(f"📁 Ditemukan {len(log_files)} file log")
        
        # Parse all logs
        all_logs = []
        for log_file in log_files:
            logs = self.parse_hybrid_logs(log_file)
            all_logs.extend(logs)
        
        print(f"📊 Total {len(all_logs)} hybrid requests ditemukan")
        
        while True:
            self.show_main_menu()
            choice = input("\nPilih menu (0-7): ")
            
            if choice == "0":
                print("👋 Terima kasih telah menggunakan Hybrid Scoring Log Viewer!")
                break
            elif choice == "1":
                self.show_all_logs(all_logs)
            elif choice == "2":
                content_logs = [log for log in all_logs if log['content_based']]
                self.show_all_logs(content_logs)
            elif choice == "3":
                collab_logs = [log for log in all_logs if log['collaborative']]
                self.show_all_logs(collab_logs)
            elif choice == "4":
                ai_logs = [log for log in all_logs if log['ai_enhanced']]
                self.show_all_logs(ai_logs)
            elif choice == "5":
                self.analyze_performance(all_logs)
            elif choice == "6":
                self.analyze_scoring_patterns(all_logs)
            elif choice == "7":
                self.show_log_statistics(all_logs)
            else:
                print("❌ Pilihan tidak valid!")
            
            input("\nTekan Enter untuk melanjutkan...")

def main():
    """Main function"""
    viewer = HybridScoringLogViewer()
    viewer.run()

if __name__ == '__main__':
    main() 