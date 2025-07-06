interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found. AI features will use mock responses.');
    }
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    if (!this.apiKey) {
      return this.getMockResponse(message);
    }

    try {
      const prompt = this.buildPrompt(message, context);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response generated');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getMockResponse(message);
    }
  }

  private buildPrompt(message: string, context?: string): string {
    const systemPrompt = `Anda adalah asisten perpustakaan digital yang cerdas dan membantu. Anda memiliki pengetahuan luas tentang buku, literatur, dan topik pendidikan. 

Tugas Anda:
- Memberikan rekomendasi buku yang relevan dan berkualitas
- Membantu pengguna menemukan informasi tentang buku, penulis, atau topik tertentu
- Memberikan ringkasan buku atau ulasan singkat
- Membantu dengan pertanyaan tentang membaca dan literasi
- Menjawab dalam bahasa Indonesia yang sopan dan informatif

${context ? `Konteks tambahan: ${context}` : ''}

Pertanyaan pengguna: ${message}

Berikan jawaban yang informatif, relevan, dan membantu:`;

    return systemPrompt;
  }

  private getMockResponse(message: string): string {
    const mockResponses = [
      `Terima kasih atas pertanyaan Anda tentang "${message}". Sebagai asisten perpustakaan digital, saya merekomendasikan untuk mengeksplorasi koleksi buku kami yang beragam. Apakah ada genre atau topik tertentu yang Anda minati?`,
      `Pertanyaan yang menarik tentang "${message}". Berdasarkan koleksi perpustakaan kami, saya dapat membantu Anda menemukan buku-buku yang relevan. Silakan jelajahi kategori yang tersedia atau beri tahu saya lebih spesifik tentang apa yang Anda cari.`,
      `Saya memahami Anda bertanya tentang "${message}". Sebagai bagian dari sistem perpustakaan digital, saya dapat membantu Anda menemukan sumber daya yang tepat. Apakah Anda mencari rekomendasi buku, informasi penulis, atau topik tertentu?`
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  async generateBookRecommendations(userPreferences: string, genre?: string): Promise<string> {
    const prompt = `Berdasarkan preferensi pengguna: "${userPreferences}"${genre ? ` dan genre: ${genre}` : ''}, 
    berikan 5 rekomendasi buku yang relevan. Untuk setiap buku, sertakan:
    - Judul dan penulis
    - Alasan mengapa buku ini cocok
    - Ringkasan singkat (1-2 kalimat)
    
    Format jawaban dalam bahasa Indonesia yang mudah dibaca.`;

    return this.generateResponse(prompt);
  }

  async summarizeBook(bookTitle: string, author?: string): Promise<string> {
    const prompt = `Berikan ringkasan singkat dan informatif tentang buku "${bookTitle}"${author ? ` karya ${author}` : ''}. 
    Sertakan:
    - Plot atau tema utama
    - Pesan atau nilai yang dapat dipetik
    - Mengapa buku ini layak dibaca
    
    Jawab dalam bahasa Indonesia, maksimal 3 paragraf.`;

    return this.generateResponse(prompt);
  }

  async getReadingTips(topic?: string): Promise<string> {
    const prompt = `Berikan tips membaca yang efektif${topic ? ` khususnya untuk ${topic}` : ''}. 
    Sertakan saran praktis yang dapat diterapkan pembaca untuk meningkatkan pemahaman dan kenikmatan membaca.
    
    Jawab dalam bahasa Indonesia dengan poin-poin yang jelas.`;

    return this.generateResponse(prompt);
  }
}

export const geminiService = new GeminiService();
export default geminiService;