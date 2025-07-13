import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBooks } from "../contexts/BookContext";
import { Book, Clock, BookOpen, ArrowUpRight, AlertCircle } from "lucide-react";
import StatisticsCard from "../components/dashboard/StatisticsCard";
import ReadingProgress from "../components/dashboard/ReadingProgress";
import ReadingChart from "../components/dashboard/ReadingChart";
import GenresPieChart from "../components/dashboard/GenresPieChart";
import { Link } from "react-router-dom";
import { borrowingAPI } from "../services/api";
import axios from '../services/axios';

interface BorrowingData {
  _id: string;
  books_id: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  is_borrow: boolean;
  fine_amount?: number;
  fine_paid?: boolean;
  book?: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
  };
}

interface DashboardStats {
  totalBorrowed: number;
  activeBorrowings: number;
  returnedBorrowings: number;
  overdueBooks: number;
  totalPagesRead: number;
  averageReadingTime: number;
}

interface BorrowingResponse {
  success: boolean;
  data: BorrowingData[];
  message?: string;
}

interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}

// Tambahkan kembali tipe interaksi user
interface UserInteraction {
  type: string; // bisa 'borrow' | 'read' | 'save' | 'search', dsb
  bookId: string;
  // Bisa tambahkan timestamp, dsb
}

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { getBookById } = useBooks();
  const [borrowings, setBorrowings] = useState<BorrowingData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBorrowed: 0,
    activeBorrowings: 0,
    returnedBorrowings: 0,
    overdueBooks: 0,
    totalPagesRead: 0,
    averageReadingTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user's dashboard statistics
        const statsResponse = await borrowingAPI.getMyDashboardStats() as unknown as DashboardStatsResponse;
        
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        // Fetch user's borrowing history with book details
        const borrowingsResponse = await borrowingAPI.getMyBorrowings() as unknown as BorrowingResponse;
        
        if (borrowingsResponse.success) {
          const borrowingsData = borrowingsResponse.data || [];
          setBorrowings(borrowingsData);
        }

        // Fetch all genres
        const genresRes = await axios.get('/genres');
        setAllGenres((genresRes.data.data || []).map((g: any) => g.genres_name));

        // Fetch user interactions dari backend dan mapping ke tipe frontend
        const interactionsRes = await axios.get(`/user-interactions?user_id=${currentUser._id}`);
        setUserInteractions(
          (interactionsRes.data || []).map((item: any) => ({
            type: item.interaction_type,
            bookId: item.book_id,
            // tambahkan field lain jika perlu
          }))
        );

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, getBookById]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {currentUser?.full_name || 'Reader'}! Track your reading progress and insights
          </p>
        </div>
        <Link to="/books" className="btn-primary flex items-center">
          <span>Discover Books</span>
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatisticsCard
          title="Books Borrowed"
          value={stats.totalBorrowed}
          icon={Book}
          color="bg-primary-600"
          change={{ value: stats.activeBorrowings, isPositive: true }}
        />
        <StatisticsCard
          title="Active Borrowings"
          value={stats.activeBorrowings}
          icon={Clock}
          color="bg-accent-600"
          change={{ value: stats.overdueBooks, isPositive: false }}
        />
        <StatisticsCard
          title="Reading Time"
          value={`${stats.averageReadingTime} hours`}
          icon={BookOpen}
          color="bg-highlight-500"
          change={{ value: stats.totalPagesRead, isPositive: true }}
        />
      </div>

      {/* Overdue Alert */}
      {stats.overdueBooks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="font-semibold text-red-800">
                You have {stats.overdueBooks} overdue book{stats.overdueBooks > 1 ? 's' : ''}
              </h3>
              <p className="text-red-600 text-sm">
                Please return them as soon as possible to avoid additional fines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Reading Progress */}
        <div className="lg:col-span-1">
          <ReadingProgress userInteractions={userInteractions} getBookById={getBookById} />
        </div>

        {/* Charts */}
        <div className="lg:col-span-2">
          <ReadingChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Genre Distribution */}
        <div>
          <GenresPieChart borrowings={borrowings} userInteractions={userInteractions} getBookById={getBookById} />
        </div>

        {/* Borrowing History */}
        <div className="card">
          <div className="border-b border-gray-100 p-4">
            <h3 className="font-semibold text-lg">Borrowing History</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {borrowings.length === 0 ? (
              <div className="p-8 text-center">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">No borrowing history yet</h4>
                <p className="text-gray-600 mb-4">Start your reading journey by borrowing your first book!</p>
                <Link to="/books" className="btn-primary">
                  Browse Books
                </Link>
              </div>
            ) : (
              borrowings.slice(0, 5).map((borrowing) => {
                const book = borrowing.book || getBookById(borrowing.books_id);
                if (!book) return null;

                const isOverdue = borrowing.is_borrow && new Date(borrowing.due_date) < new Date();
                const isActive = borrowing.is_borrow;

                return (
                  <div
                    key={borrowing._id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shadow-sm mr-4"
                      />
                      <div>
                        <h4 className="font-medium">{book.title}</h4>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">
                            Borrowed:{" "}
                          </span>
                          <span className="text-xs ml-1">
                            {new Date(borrowing.borrow_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          isOverdue
                            ? "bg-red-100 text-red-800"
                            : isActive
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isOverdue ? "Overdue" : isActive ? "Active" : "Returned"}
                      </span>
                      {isActive && (
                        <div className="text-xs text-gray-500 mt-1">
                          Due:{" "}
                          {new Date(borrowing.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                      {borrowing.fine_amount && borrowing.fine_amount > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Fine: ${borrowing.fine_amount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {borrowings.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-b-lg text-center">
              <Link
                to="/borrow"
                className="text-primary-600 hover:text-primary-800 font-medium text-sm"
              >
                View all borrowings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
