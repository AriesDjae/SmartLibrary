import React, { useEffect, useState } from "react";
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

// Import API service
import { booksAPI } from "../services/api";
import axiosInstance from "../services/axios";

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
  const { filterBooksByGenre } = useBooks(); // Masih gunakan untuk related books
  const { isAuthenticated, currentUser } = useAuth();
  const { addBorrowedBook, fetchBorrowedBooks } = useBorrow();
  
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  
  // State untuk data dari database
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const handleBookmark = () => {
    // ... logic bookmark ...
    axiosInstance.post("/user-interactions", {
      user_id: currentUser?._id,
      book_id: book.id,
      interaction_type: "bookmark",
      timestamp: new Date().toISOString(),
      interaction_details: "Bookmarked this book"
    });
  };
  
  // State untuk review dan UI
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



  // Fetch book data from database
  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    booksAPI.getById(id)
      .then((response) => {
        console.log("Book detail response:", response);
        setBook(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Gagal mengambil detail buku");
        setLoading(false);
      });
  }, [id]);

  // Kirim interaksi "view" ke backend saat user membuka halaman detail buku
  useEffect(() => {
    if (!id || !currentUser?._id) return;
    // Data interaksi yang akan dikirim
    const interactionData = {
      user_id: currentUser?._id, // pastikan sesuai field backend
      book_id: id,
      interaction_type: "view",
      timestamp: new Date().toISOString(),
      interaction_details: "Viewed book detail page"
    };
    // Kirim POST ke backend
    axiosInstance.post("/user-interactions", interactionData)
      .then(() => {
        console.log("Interaksi view berhasil dikirim");
      })
      .catch((err) => {
        console.error("Gagal mengirim interaksi view:", err);
      });
  }, [id, currentUser?._id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-48 h-64 md:w-56 md:h-80 bg-gray-200 rounded-lg"></div>
                <div className="flex-grow space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p className="mb-8">{error}</p>
        <Link to="/books" className="btn-primary">
          Kembali ke Koleksi Buku
        </Link>
      </div>
    );
  }

  // Book not found
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
      userId: currentUser?._id || "",
      userName: currentUser?.full_name || "Anonymous",
      userInitials:
        currentUser?.full_name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("") || "AN",
      rating: review.rating,
      comment: review.comment,
      date: "Baru saja",
    };
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
  };

  const handleBorrow = async () => {
    if (!currentUser?._id) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    // Buat tanggal pinjam dan jatuh tempo (7 hari)
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);

    // Data yang akan dikirim ke backend
    const borrowData = {
      user_id: currentUser._id,
      books_id: book.id,
      borrow_date: today.toISOString(),
      due_date: due.toISOString(),
      is_borrow: true
    };

    try {
      // Kirim ke backend
      const response = await fetch("/api/borrowings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(borrowData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal meminjam buku");
      }

      // Fetch ulang data pinjaman dari backend agar list selalu update
      await fetchBorrowedBooks();
      // Redirect ke halaman peminjaman
      navigate("/borrow");
    } catch (err) {
      console.error("Error borrowing book:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal meminjam buku. Silakan coba lagi.";
      alert(errorMessage);
    }
  };

  // Handler untuk klik tombol "Read Now"
  const handleClickRead = () => {
    if (!currentUser?._id || !book?.id) return;
    axiosInstance.post("/user-interactions", {
      user_id: currentUser?._id,
      book_id: book.id,
      interaction_type: "click",
      timestamp: new Date().toISOString(),
      interaction_details: "Clicked 'Read Now' button"
    }).then(() => {
      console.log("Interaksi click (Read Now) berhasil dikirim");
    }).catch((err) => {
      console.error("Gagal mengirim interaksi click (Read Now):", err);
    });
  };

  // Handler untuk klik tombol "Borrow"
  const handleBorrowWithInteraction = async () => {
    await handleBorrow(); // logic pinjam buku lama
    if (!currentUser?._id || !book?.id) return;
    axiosInstance.post("/user-interactions", {
      user_id: currentUser?._id,
      book_id: book.id,
      interaction_type: "borrow",
      timestamp: new Date().toISOString(),
      interaction_details: "Clicked 'Borrow' button"
    }).then(() => {
      console.log("Interaksi borrow berhasil dikirim");
    }).catch((err) => {
      console.error("Gagal mengirim interaksi borrow:", err);
    });
  };

  // Handler untuk klik tombol "Bookmark"
  const handleBookmarkWithInteraction = () => {
    console.log("Tombol bookmark diklik");
    handleBookmark(); // logic bookmark lama
    if (!currentUser?._id || !book?.id) {
      console.log("User atau book tidak ada", { user: currentUser?._id, book: book?.id });
      return;
    }
    console.log("Mengirim request axios...");
    axiosInstance.post("/user-interactions", {
      user_id: currentUser?._id,
      book_id: book.id,
      interaction_type: "bookmark",
      timestamp: new Date().toISOString(),
      interaction_details: "Clicked 'Bookmark' button"
    }).then(() => {
      console.log("Interaksi bookmark berhasil dikirim");
    }).catch((err) => {
      console.error("Gagal mengirim interaksi bookmark:", err);
    });
  };


  // Get related books based on primary genre
  const primaryGenre = book.genres?.[0];
  const relatedBooks = primaryGenre 
    ? filterBooksByGenre(primaryGenre)
        .filter((b) => b.id !== book.id)
        .slice(0, 4)
    : [];

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
                      {book.genres && book.genres.length > 0 ? (
                        book.genres.map((genre: string) => (
                          <span
                            key={genre}
                            className="badge bg-white/10 text-white px-3 py-1"
                          >
                            {genre}
                          </span>
                        ))
                      ) : (
                        <span className="badge bg-white/10 text-white px-3 py-1">
                          Tidak ada genre
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {book.title}
                    </h1>
                    <p className="text-xl text-blue-100 mb-4">
                      By {book.author}
                    </p>

                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{book.rating || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <AlignJustify className="h-5 w-5 text-blue-200 mr-1" />
                        <span>{book.pageCount} pages</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-200 mr-1" />
                        <span className="text-white text-sm truncate">
                          {book.publishedDate && !isNaN(Date.parse(book.publishedDate))
                            ? new Date(book.publishedDate + 'T00:00:00').toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })
                            : "N/A"}
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
                              onClick={handleClickRead}
                            >
                              Read Now
                            </Link>
                            <button
                              onClick={handleBorrowWithInteraction}
                              className="btn bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <BookCheck className="h-5 w-5 mr-2" />
                              Borrow
                            </button>
                          </>
                        ) : (
                          <Link to="/sign-in" className="btn-primary">
                            Sign In to Read
                          </Link>
                        )
                      ) : (
                        <button
                          disabled
                          className="btn bg-gray-400 text-white cursor-not-allowed"
                        >
                          Not Available
                        </button>
                      )}

                      {isAuthenticated && (
                        <>
                          <button onClick={handleBookmarkWithInteraction}
                                  className="btn bg-white/10 hover:bg-white/20 text-white" >
                            <Bookmark className="h-5 w-5 mr-2" />
                            Read Later
                          </button>
                        </>
                      )}

                      <button className="btn bg-white/10 hover:bg-white/20 text-white">
                        <Share2 className="h-5 w-5 mr-2" />
                        Share
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

                {/* Elegant Book Info Section */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 flex-1 min-w-0">
                    <BookOpenText className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-500 text-sm font-medium flex-shrink-0">ISBN:</span>
                    <span className="text-gray-900 text-sm truncate">{book.isbn}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 flex-1 min-w-0">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-500 text-sm font-medium flex-shrink-0">Published Date:</span>
                    <span className="text-gray-900 text-sm truncate">
                      {book.publishedDate && !isNaN(Date.parse(book.publishedDate))
                        ? new Date(book.publishedDate + 'T00:00:00').toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 flex-1 min-w-0">
                    <Bookmark className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-500 text-sm font-medium flex-shrink-0">Status:</span>
                    <span className={book.isAvailable ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {book.isAvailable ? "Available" : "In Borrow"}
                    </span>
                  </div>
                </div>

                {/* Popular Badge */}
                {book.isPopular && (
                  <div className="mb-8">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-4 w-4 mr-1" />
                      Buku Populer
                    </span>
                  </div>
                )}

                {/* Reader Reviews Section */}
                <div className="mt-12" id="review-section">
                  <h2 className="text-2xl font-semibold mb-6">Ulasan Pembaca</h2>
                  {isAuthenticated && (
                    <div className="mb-8" id="review-form">
                      <ReviewForm
                        bookId={book.id}
                        onSubmit={handleAddReview}
                        onCancel={() => {}}
                      />
                    </div>
                  )}
                  <div className="space-y-8">
                    {reviews.map((review, idx) => (
                      <div
                        key={review.id}
                        className="bg-white rounded-xl shadow p-6 border border-gray-100 flex gap-4 relative"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow">
                            {review.userInitials}
                          </div>
                        </div>
                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                            <span className="font-semibold text-gray-900 truncate">{review.userName}</span>
                            <span className="text-xs text-gray-500">{review.date}</span>
                            <span className="flex items-center gap-0.5 ml-0 sm:ml-2">
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-2 leading-relaxed break-words">{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {review.images.map((img, i) => (
                                <img key={i} src={img} alt={`Review image ${i+1}`} className="w-full h-20 object-cover rounded-lg border" />
                              ))}
                            </div>
                          )}
                          {/* Action Buttons */}
                          <div className="flex gap-4 mt-3 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-primary-600 font-medium transition">
                              <svg xmlns='http://www.w3.org/2000/svg' className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5A2.5 2.5 0 014.5 8h2.379a.5.5 0 00.354-.146l3.793-3.793A2.5 2.5 0 0115.5 7.5V8h1A2.5 2.5 0 0119 10.5v2A2.5 2.5 0 0116.5 15h-7.379a.5.5 0 00-.354.146l-2.793 2.793A2.5 2.5 0 012 15.5v-5z" /></svg>
                              Suka <span className="ml-1">· 0</span>
                            </button>
                            <button className="hover:text-primary-600 font-medium transition">Balas</button>
                          </div>
                        </div>
                        {idx < reviews.length - 1 && <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-100 mt-6" />}
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
                      {relatedBooks.map((relatedBook) => (
                        <BookCard key={relatedBook.id} book={relatedBook} size="small" />
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


// //import React, { useEffect, useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { useBooks } from "../contexts/BookContext";
// import { useAuth } from "../contexts/AuthContext";
// import { useBorrow } from "../contexts/BorrowContext";
// import {
//   Calendar,
//   Star,
//   Bookmark,
//   Share2,
//   BookOpenText,
//   AlignJustify,
//   Heart,
//   ArrowLeft,
//   MessageSquare,
//   BookOpen,
//   BookCheck,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import BookCard from "../components/books/BookCard";
// import ReviewForm from "../components/books/ReviewForm";
// import axios from "axios";

// //aulira
// import { booksAPI } from "../services/api"; // gunakan booksAPI


// interface Review {
//   id: string;
//   userId: string;
//   userName: string;
//   userInitials: string;
//   rating: number;
//   comment: string;
//   date: string;
//   images?: string[];
// }


// const BookDetailPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const { getBookById, filterBooksByGenre } = useBooks();
//   const { isAuthenticated, currentUser } = useAuth();
//   const { addBorrowedBook, fetchBorrowedBooks } = useBorrow();
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [reviews, setReviews] = useState<Review[]>([
//     {
//       id: "1",
//       userId: "1",
//       userName: "Jamie Smith",
//       userInitials: "JS",
//       rating: 5,
//       comment:
//         "This book completely changed my perspective. The character development is incredible and the pacing kept me engaged from start to finish.",
//       date: "2 weeks ago",
//     },
//     {
//       id: "2",
//       userId: "2",
//       userName: "Alex Lee",
//       userInitials: "AL",
//       rating: 4,
//       comment:
//         "A thought-provoking read with beautiful prose. I took away one star because the ending felt a bit rushed, but overall it's definitely worth reading.",
//       date: "1 month ago",
//     },
//   ]);
//   const navigate = useNavigate();

//   const book = getBookById(id || "");

//   if (!book) {
//     return (
//       <div className="container mx-auto px-4 py-16 text-center">
//         <h2 className="text-2xl font-bold mb-4">Buku Tidak Ditemukan</h2>
//         <p className="mb-8">
//           Buku yang Anda cari tidak ada atau telah dihapus.
//         </p>
//         <Link to="/books" className="btn-primary">
//           Kembali ke Koleksi Buku
//         </Link>
//       </div>
//     );
//   }

//   const handleAddReview = (review: { rating: number; comment: string }) => {
//     const newReview: Review = {
//       id: Date.now().toString(),
//       userId: currentUser?.id || "",
//       userName: currentUser?.name || "Anonymous",
//       userInitials:
//         currentUser?.name
//           ?.split(" ")
//           .map((n) => n[0])
//           .join("") || "AN",
//       rating: review.rating,
//       comment: review.comment,
//       date: "Baru saja",
//     };
//     setReviews([newReview, ...reviews]);
//     setShowReviewForm(false);
//   };

//   const handleBorrow = async () => {
//     // Buat tanggal pinjam dan jatuh tempo (misal 14 hari)
//     const today = new Date();
//     const due = new Date();
//     due.setDate(today.getDate() + 14);

//     // Data yang akan dikirim ke backend
//     const borrowData = {
//       userId: currentUser?.id || "guest",
//       bookId: book.id,
//       title: book.title,
//       author: book.author,
//       borrowedDate: today.toISOString().slice(0, 10),
//       dueDate: due.toISOString().slice(0, 10),
//       status: "Dipinjam",
//       cover: book.coverImage,
//       category: book.genres[0] || "Lainnya",
//       description: book.description,
//     };

//     try {
//       // Kirim ke backend
//       await axios.post("/api/peminjaman", borrowData);
//       // Fetch ulang data pinjaman dari backend agar list selalu update
//       await fetchBorrowedBooks();
//       // Redirect ke halaman peminjaman
//       navigate("/borrow");
//     } catch (err) {
//       alert("Gagal meminjam buku. Silakan coba lagi.");
//     }
//   };

//   // Get related books based on primary genre
//   const primaryGenre = book.genres[0];
//   const relatedBooks = filterBooksByGenre(primaryGenre)
//     .filter((b) => b.id !== book.id)
//     .slice(0, 4);

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4">
//         <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
//           <Link
//             to="/books"
//             className="inline-flex items-center text-gray-600 hover:text-primary-700 mb-6"
//           >
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Kembali ke Koleksi
//           </Link>

//           <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
//             {/* Book Header */}
//             <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white p-6 md:p-8">
//               <div className="flex flex-col md:flex-row gap-8">
//                 {/* Book Cover */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5 }}
//                   className="w-48 h-64 md:w-56 md:h-80 mx-auto md:mx-0 flex-shrink-0"
//                 >
//                   <img
//                     src={book.coverImage}
//                     alt={book.title}
//                     className="w-full h-full object-cover rounded-lg shadow-lg"
//                   />
//                 </motion.div>

//                 {/* Book Info */}
//                 <div className="flex-grow">
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.2 }}
//                   >
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       {book.genres.map((genre) => (
//                         <span
//                           key={genre}
//                           className="badge bg-white/10 text-white px-3 py-1"
//                         >
//                           {genre}
//                         </span>
//                       ))}
//                     </div>

//                     <h1 className="text-3xl md:text-4xl font-bold mb-2">
//                       {book.title}
//                     </h1>
//                     <p className="text-xl text-blue-100 mb-4">
//                       oleh {book.author}
//                     </p>

//                     <div className="flex items-center space-x-4 mb-6">
//                       <div className="flex items-center">
//                         <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
//                         <span className="font-medium">{book.rating}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <AlignJustify className="h-5 w-5 text-blue-200 mr-1" />
//                         <span>{book.pageCount} halaman</span>
//                       </div>
//                       <div className="flex items-center">
//                         <Calendar className="h-5 w-5 text-blue-200 mr-1" />
//                         <span>
//                           {new Date(book.publishedDate).getFullYear()}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap gap-3 mt-auto">
//                       {book.isAvailable ? (
//                         isAuthenticated ? (
//                           <>
//                             <Link
//                               to={`/reader/${book.id}`}
//                               className="btn-primary"
//                             >
//                               Baca Sekarang
//                             </Link>
//                             <button
//                               onClick={handleBorrow}
//                               className="btn bg-blue-500 hover:bg-blue-600 text-white"
//                             >
//                               <BookCheck className="h-5 w-5 mr-2" />
//                               Pinjam Buku
//                             </button>
//                           </>
//                         ) : (
//                           <Link to="/sign-in" className="btn-primary">
//                             Masuk untuk Membaca
//                           </Link>
//                         )
//                       ) : (
//                         <button
//                           disabled
//                           className="btn bg-gray-400 text-white cursor-not-allowed"
//                         >
//                           Saat Ini Tidak Tersedia
//                         </button>
//                       )}

//                       {isAuthenticated && (
//                         <button className="btn bg-white/10 hover:bg-white/20 text-white">
//                           <Bookmark className="h-5 w-5 mr-2" />
//                           Simpan untuk Nanti
//                         </button>
//                       )}

//                       <button className="btn bg-white/10 hover:bg-white/20 text-white">
//                         <Share2 className="h-5 w-5 mr-2" />
//                         Bagikan
//                       </button>
//                     </div>
//                   </motion.div>
//                 </div>
//               </div>
//             </div>

//             {/* Book Details */}
//             <div className="p-6 md:p-8">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.4 }}
//               >
//                 <h2 className="text-2xl font-semibold mb-4">
//                   Tentang Buku Ini
//                 </h2>
//                 <p className="text-gray-700 leading-relaxed mb-8">
//                   {book.description}
//                 </p>

//                 {/* Elegant Book Info Section */}
//                 <div className="flex flex-col sm:flex-row gap-4 mb-8">
//                   <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 flex-1 min-w-0">
//                     <BookOpenText className="h-5 w-5 text-primary-600" />
//                     <span className="text-gray-500 text-sm font-medium flex-shrink-0">ISBN:</span>
//                     <span className="text-gray-900 text-sm truncate">{book.isbn}</span>
//                   </div>
//                   <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 flex-1 min-w-0">
//                     <Calendar className="h-5 w-5 text-primary-600" />
//                     <span className="text-gray-500 text-sm font-medium flex-shrink-0">Tanggal Terbit:</span>
//                     <span className="text-gray-900 text-sm truncate">{new Date(book.publishedDate).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
//                   </div>
//                   <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 flex-1 min-w-0">
//                     <Bookmark className="h-5 w-5 text-primary-600" />
//                     <span className="text-gray-500 text-sm font-medium flex-shrink-0">Status:</span>
//                     <span className={book.isAvailable ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{book.isAvailable ? "Tersedia" : "Sedang Dipinjam"}</span>
//                   </div>
//                 </div>

//                 {/* Reader Reviews Section */}
//                 <div className="mt-12" id="review-section">
//                   <h2 className="text-2xl font-semibold mb-6">Ulasan Pembaca</h2>
//                   {isAuthenticated && (
//                     <div className="mb-8" id="review-form">
//                       <ReviewForm
//                         bookId={book.id}
//                         onSubmit={handleAddReview}
//                         onCancel={() => {}}
//                       />
//                     </div>
//                   )}
//                   <div className="space-y-8">
//                     {reviews.map((review, idx) => (
//                       <div
//                         key={review.id}
//                         className="bg-white rounded-xl shadow p-6 border border-gray-100 flex gap-4 relative"
//                       >
//                         {/* Avatar */}
//                         <div className="flex-shrink-0">
//                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow">
//                             {review.userInitials}
//                           </div>
//                         </div>
//                         {/* Review Content */}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
//                             <span className="font-semibold text-gray-900 truncate">{review.userName}</span>
//                             <span className="text-xs text-gray-500">{review.date}</span>
//                             <span className="flex items-center gap-0.5 ml-0 sm:ml-2">
//                               {[1,2,3,4,5].map((star) => (
//                                 <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
//                               ))}
//                             </span>
//                           </div>
//                           <p className="text-gray-800 mb-2 leading-relaxed break-words">{review.comment}</p>
//                           {review.images && review.images.length > 0 && (
//                             <div className="grid grid-cols-3 gap-2 mt-2">
//                               {review.images.map((img, i) => (
//                                 <img key={i} src={img} alt={`Review image ${i+1}`} className="w-full h-20 object-cover rounded-lg border" />
//                               ))}
//                             </div>
//                           )}
//                           {/* Action Buttons */}
//                           <div className="flex gap-4 mt-3 text-sm text-gray-500">
//                             <button className="flex items-center gap-1 hover:text-primary-600 font-medium transition">
//                               <svg xmlns='http://www.w3.org/2000/svg' className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5A2.5 2.5 0 014.5 8h2.379a.5.5 0 00.354-.146l3.793-3.793A2.5 2.5 0 0115.5 7.5V8h1A2.5 2.5 0 0119 10.5v2A2.5 2.5 0 0116.5 15h-7.379a.5.5 0 00-.354.146l-2.793 2.793A2.5 2.5 0 012 15.5v-5z" /></svg>
//                               Suka <span className="ml-1">· 0</span>
//                             </button>
//                             <button className="hover:text-primary-600 font-medium transition">Balas</button>
//                           </div>
//                         </div>
//                         {idx < reviews.length - 1 && <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-100 mt-6" />}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Related Books Section */}
//                 {relatedBooks.length > 0 && (
//                   <div className="mt-12">
//                     <h2 className="text-2xl font-semibold mb-6">
//                       Buku Terkait
//                     </h2>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                       {relatedBooks.map((book) => (
//                         <BookCard key={book.id} book={book} size="small" />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookDetailPage;



