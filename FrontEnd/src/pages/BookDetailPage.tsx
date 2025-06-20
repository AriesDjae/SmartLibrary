import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBooks } from "../contexts/BookContext";
import { useAuth } from "../contexts/AuthContext";
import { useBorrow } from "../contexts/BorrowContext";
import {
  Calendar,
  Star,
  Bookmark,
  Share2,
  BookOpenText,
  AlignJustify,
  Heart,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  BookCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import BookCard from "../components/books/BookCard";
import ReviewForm from "../components/books/ReviewForm";
import axios from "axios";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, filterBooksByGenre } = useBooks();
  const { isAuthenticated, currentUser } = useAuth();
  const { addBorrowedBook, fetchBorrowedBooks } = useBorrow();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      userId: "1",
      userName: "Jamie Smith",
      userInitials: "JS",
      rating: 5,
      comment:
        "This book completely changed my perspective. The character development is incredible and the pacing kept me engaged from start to finish.",
      date: "2 weeks ago",
    },
    {
      id: "2",
      userId: "2",
      userName: "Alex Lee",
      userInitials: "AL",
      rating: 4,
      comment:
        "A thought-provoking read with beautiful prose. I took away one star because the ending felt a bit rushed, but overall it's definitely worth reading.",
      date: "1 month ago",
    },
  ]);
  const navigate = useNavigate();

  const book = getBookById(id || "");

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Buku Tidak Ditemukan</h2>
        <p className="mb-8">
          Buku yang Anda cari tidak ada atau telah dihapus.
        </p>
        <Link to="/books" className="btn-primary">
          Kembali ke Koleksi Buku
        </Link>
      </div>
    );
  }

  const handleAddReview = (review: { rating: number; comment: string }) => {
    const newReview: Review = {
      id: Date.now().toString(),
      userId: currentUser?.id || "",
      userName: currentUser?.name || "Anonymous",
      userInitials:
        currentUser?.name
          ?.split(" ")
          .map((n) => n[0])
          .join("") || "AN",
      rating: review.rating,
      comment: review.comment,
      date: "Baru saja",
    };
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
  };

  const handleBorrow = async () => {
    // Buat tanggal pinjam dan jatuh tempo (misal 14 hari)
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);

    // Data yang akan dikirim ke backend
    const borrowData = {
      userId: currentUser?.id || "guest",
      bookId: book.id,
      title: book.title,
      author: book.author,
      borrowedDate: today.toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
      status: "Dipinjam",
      cover: book.coverImage,
      category: book.genres[0] || "Lainnya",
      description: book.description,
    };

    try {
      // Kirim ke backend
      await axios.post("/api/peminjaman", borrowData);
      // Fetch ulang data pinjaman dari backend agar list selalu update
      await fetchBorrowedBooks();
      // Redirect ke halaman peminjaman
      navigate("/borrow");
    } catch (err) {
      alert("Gagal meminjam buku. Silakan coba lagi.");
    }
  };

  // Get related books based on primary genre
  const primaryGenre = book.genres[0];
  const relatedBooks = filterBooksByGenre(primaryGenre)
    .filter((b) => b.id !== book.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <Link
            to="/books"
            className="inline-flex items-center text-gray-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Koleksi
          </Link>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {/* Book Header */}
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Book Cover */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-48 h-64 md:w-56 md:h-80 mx-auto md:mx-0 flex-shrink-0"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </motion.div>

                {/* Book Info */}
                <div className="flex-grow">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.genres.map((genre) => (
                        <span
                          key={genre}
                          className="badge bg-white/10 text-white px-3 py-1"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {book.title}
                    </h1>
                    <p className="text-xl text-blue-100 mb-4">
                      oleh {book.author}
                    </p>

                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{book.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <AlignJustify className="h-5 w-5 text-blue-200 mr-1" />
                        <span>{book.pageCount} halaman</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-200 mr-1" />
                        <span>
                          {new Date(book.publishedDate).getFullYear()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-auto">
                      {book.isAvailable ? (
                        isAuthenticated ? (
                          <>
                            <Link
                              to={`/reader/${book.id}`}
                              className="btn-primary"
                            >
                              Baca Sekarang
                            </Link>
                            <button
                              onClick={handleBorrow}
                              className="btn bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <BookCheck className="h-5 w-5 mr-2" />
                              Pinjam Buku
                            </button>
                          </>
                        ) : (
                          <Link to="/sign-in" className="btn-primary">
                            Masuk untuk Membaca
                          </Link>
                        )
                      ) : (
                        <button
                          disabled
                          className="btn bg-gray-400 text-white cursor-not-allowed"
                        >
                          Saat Ini Tidak Tersedia
                        </button>
                      )}

                      {isAuthenticated && (
                        <button className="btn bg-white/10 hover:bg-white/20 text-white">
                          <Bookmark className="h-5 w-5 mr-2" />
                          Simpan untuk Nanti
                        </button>
                      )}

                      <button className="btn bg-white/10 hover:bg-white/20 text-white">
                        <Share2 className="h-5 w-5 mr-2" />
                        Bagikan
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Tentang Buku Ini
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {book.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="card p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-500 mb-1">ISBN</h3>
                    <p>{book.isbn}</p>
                  </div>
                  <div className="card p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-500 mb-1">
                      Tanggal Terbit
                    </h3>
                    <p>
                      {new Date(book.publishedDate).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div className="card p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-500 mb-1">Status</h3>
                    <p
                      className={
                        book.isAvailable ? "text-green-600" : "text-red-600"
                      }
                    >
                      {book.isAvailable ? "Tersedia" : "Sedang Dipinjam"}
                    </p>
                  </div>
                </div>

                {/* Reader Reviews Section */}
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Ulasan Pembaca</h2>
                    {isAuthenticated ? (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="btn-primary"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Tulis Ulasan
                      </button>
                    ) : (
                      <Link to="/sign-in" className="btn-primary">
                        Masuk untuk Menulis Ulasan
                      </Link>
                    )}
                  </div>

                  {showReviewForm && (
                    <div className="mb-8">
                      <ReviewForm
                        bookId={book.id}
                        onSubmit={handleAddReview}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  )}

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium mr-3">
                              {review.userInitials}
                            </div>
                            <div>
                              <h4 className="font-medium">{review.userName}</h4>
                              <p className="text-sm text-gray-500">
                                {review.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <span className="ml-1 font-medium">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Books Section */}
                {relatedBooks.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-semibold mb-6">
                      Buku Terkait
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {relatedBooks.map((book) => (
                        <BookCard key={book.id} book={book} size="small" />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
