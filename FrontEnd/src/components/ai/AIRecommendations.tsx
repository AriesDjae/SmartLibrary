import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Users, Brain, Loader2 } from "lucide-react";
import { aiAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  cover_image?: string;
  genre?: string;
}

interface Recommendations {
  content_based: Book[];
  collaborative: Book[];
  ai_enhanced: Book[];
}

interface AIRecommendationsProps {
  userId?: string;
  bookId?: string;
  userPreferences?: string;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  userId,
  bookId,
  userPreferences,
}) => {
  const [recommendations, setRecommendations] =
    useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hybrid" | "content" | "collaborative" | "ai"
  >("hybrid");

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await aiAPI.getHybridRecommendations({
        user_id: userId,
        book_id: bookId,
        user_preferences: userPreferences,
        n_recommendations: 5,
      });

      setRecommendations(response.recommendations);
      toast.success("Rekomendasi AI berhasil dimuat!");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Gagal memuat rekomendasi AI");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId || bookId || userPreferences) {
      fetchRecommendations();
    }
  }, [userId, bookId, userPreferences]);

  const renderBookCard = (book: Book, index: number) => (
    <Link
      to={`/books/${book._id}`}
      className="block group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden"
      key={`ai-book-card-${book._id}-${index}`}
      style={{ minHeight: 220 }}
    >
      <div className="relative h-40 overflow-hidden flex items-center justify-center bg-gray-50">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
        {/* Badge genre */}
        {book.genre && (
          <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full shadow">
            {book.genre}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors text-base mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-gray-600 mb-1">{book.author}</p>
        {book.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-1">
            {book.description}
          </p>
        )}
        <button className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium group-hover:bg-blue-100 transition">
          Lihat Detail
        </button>
      </div>
    </Link>
  );

  const tabs = [
    {
      id: "hybrid",
      name: "Hybrid",
      icon: <Sparkles className="w-4 h-4" />,
      description: "Kombinasi semua metode",
    },
    {
      id: "content",
      name: "Content-Based",
      icon: <BookOpen className="w-4 h-4" />,
      description: "Berdasarkan konten buku",
    },
    {
      id: "collaborative",
      name: "Collaborative",
      icon: <Users className="w-4 h-4" />,
      description: "Berdasarkan pengguna lain",
    },
    {
      id: "ai",
      name: "AI-Enhanced",
      icon: <Brain className="w-4 h-4" />,
      description: "Ditingkatkan dengan AI",
    },
  ];

  const getActiveBooks = () => {
    if (!recommendations) return [];

    switch (activeTab) {
      case "content":
        return recommendations.content_based;
      case "collaborative":
        return recommendations.collaborative;
      case "ai":
        return recommendations.ai_enhanced;
      case "hybrid":
      default:
        return [
          ...recommendations.content_based,
          ...recommendations.collaborative,
          ...recommendations.ai_enhanced,
        ];
    }
  };

  if (!userId && !bookId && !userPreferences) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Rekomendasi AI
        </h3>
        <p className="text-gray-600">
          Pilih buku atau masukkan preferensi untuk mendapatkan rekomendasi AI
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rekomendasi AI</h2>
          <p className="text-gray-600 mt-1">
            Rekomendasi buku yang dipersonalisasi untuk Anda
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Memuat rekomendasi...</span>
        </div>
      ) : recommendations ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {getActiveBooks().map((book, index) => renderBookCard(book, index))}
          </div>
          {getActiveBooks().length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Tidak ada rekomendasi yang tersedia untuk metode ini
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Klik "Refresh" untuk memuat rekomendasi
          </p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
