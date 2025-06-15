import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Star, 
  Bookmark, 
  Share2, 
  BookOpenText,
  AlignJustify, 
  Heart,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import BookCard from '../components/books/BookCard';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, filterBooksByGenre } = useBooks();
  const { isAuthenticated } = useAuth();
  const book = getBookById(id || '');
  
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
        <p className="mb-8">The book you're looking for doesn't exist or has been removed.</p>
        <Link to="/books" className="btn-primary">
          Return to Book Collection
        </Link>
      </div>
    );
  }
  
  // Get related books based on primary genre
  const primaryGenre = book.genres[0];
  const relatedBooks = filterBooksByGenre(primaryGenre)
    .filter(b => b.id !== book.id)
    .slice(0, 4);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/books" className="inline-flex items-center text-gray-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Collection
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
                  {book.genres.map(genre => (
                    <span key={genre} className="badge bg-white/10 text-white px-3 py-1">
                      {genre}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
                <p className="text-xl text-blue-100 mb-4">by {book.author}</p>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium">{book.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <AlignJustify className="h-5 w-5 text-blue-200 mr-1" />
                    <span>{book.pageCount} pages</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-200 mr-1" />
                    <span>{new Date(book.publishedDate).getFullYear()}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-auto">
                  {book.isAvailable ? (
                    isAuthenticated ? (
                      <Link to={`/reader/${book.id}`} className="btn-primary">
                        Read Now
                      </Link>
                    ) : (
                      <Link to="/sign-in" className="btn-primary">
                        Sign In to Read
                      </Link>
                    )
                  ) : (
                    <button disabled className="btn bg-gray-400 text-white cursor-not-allowed">
                      Currently Unavailable
                    </button>
                  )}
                  
                  {isAuthenticated && (
                    <button className="btn bg-white/10 hover:bg-white/20 text-white">
                      <Bookmark className="h-5 w-5 mr-2" />
                      Save for Later
                    </button>
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
            <h2 className="text-2xl font-semibold mb-4">About This Book</h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              {book.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="card p-4 border border-gray-200">
                <h3 className="font-medium text-gray-500 mb-1">ISBN</h3>
                <p>{book.isbn}</p>
              </div>
              <div className="card p-4 border border-gray-200">
                <h3 className="font-medium text-gray-500 mb-1">Published</h3>
                <p>{new Date(book.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div className="card p-4 border border-gray-200">
                <h3 className="font-medium text-gray-500 mb-1">Status</h3>
                <p className={book.isAvailable ? 'text-green-600' : 'text-red-600'}>
                  {book.isAvailable ? 'Available' : 'Currently Borrowed'}
                </p>
              </div>
            </div>
            
            {/* Reader Reviews Section (mockup) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Reader Reviews</h2>
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  See All
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-3">
                        JS
                      </div>
                      <div>
                        <h4 className="font-medium">Jamie Smith</h4>
                        <div className="flex text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2 weeks ago</span>
                  </div>
                  <p className="text-gray-700">
                    This book completely changed my perspective. The character development is incredible and the pacing kept me engaged from start to finish.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 font-bold mr-3">
                        AL
                      </div>
                      <div>
                        <h4 className="font-medium">Alex Lee</h4>
                        <div className="flex text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">1 month ago</span>
                  </div>
                  <p className="text-gray-700">
                    A thought-provoking read with beautiful prose. I took away one star because the ending felt a bit rushed, but overall it's definitely worth reading.
                  </p>
                </div>
              </div>
              
              {isAuthenticated ? (
                <button className="mt-4 text-primary-600 hover:text-primary-800 flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  Write a review
                </button>
              ) : (
                <Link to="/sign-in" className="mt-4 text-primary-600 hover:text-primary-800 flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  Sign in to write a review
                </Link>
              )}
            </div>
            
            {/* Similar Books */}
            {relatedBooks.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Similar Books</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedBooks.map(relatedBook => (
                    <BookCard key={relatedBook.id} book={relatedBook} size="small" />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;