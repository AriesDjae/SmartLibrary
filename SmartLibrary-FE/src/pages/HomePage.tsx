import React from 'react';
import Hero from '../components/home/Hero';
import BookCarousel from '../components/books/BookCarousel';
import { useBooks } from '../contexts/BookContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { featuredBooks, popularBooks, newArrivals, getUserRecommendations } = useBooks();
  const { isAuthenticated } = useAuth();
  
  const recommendations = isAuthenticated ? getUserRecommendations() : [];
  
  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  return (
    <>
      <Hero />
      
      <div className="container mx-auto px-4 py-12">
        {/* Recommended Books (for authenticated users) */}
        {isAuthenticated && recommendations.length > 0 && (
          <div className="mb-12">
            <BookCarousel 
              title="Recommended for You" 
              books={recommendations}
              description="Personalized suggestions based on your reading preferences"
            />
          </div>
        )}
        
        {/* Featured Books */}
        <div className="mb-12">
          <BookCarousel 
            title="Featured Books" 
            books={featuredBooks}
          />
        </div>
        
        {/* Why Choose Us Section */}
        <motion.section 
          className="py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Digital Library</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of reading with our AI-powered platform designed to enhance your knowledge journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="card p-6 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                <Sparkles className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Recommendations</h3>
              <p className="text-gray-600">
                Discover books tailored to your interests with our advanced recommendation engine.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="card p-6 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-teal-100 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-accent-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Extensive Collection</h3>
              <p className="text-gray-600">
                Access thousands of books across all genres, from bestsellers to academic resources.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="card p-6 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4">
                <TrendingUp className="h-6 w-6 text-highlight-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Your Progress</h3>
              <p className="text-gray-600">
                Monitor your reading habits with detailed statistics and personalized insights.
              </p>
            </motion.div>
          </div>
        </motion.section>
        
        {/* Popular Books */}
        <div className="my-12">
          <BookCarousel 
            title="Popular Reads" 
            books={popularBooks}
            description="Most borrowed books this month"
          />
        </div>
        
        {/* New Arrivals */}
        <div className="my-12">
          <BookCarousel 
            title="New Arrivals" 
            books={newArrivals}
            description="The latest additions to our collection"
          />
        </div>
        
        {/* CTA Section */}
        <div className="my-16 bg-gradient-to-r from-primary-800 to-primary-900 rounded-xl text-white p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Reading?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of readers who are already enjoying our digital library platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/sign-up" className="btn bg-white text-primary-800 hover:bg-blue-50 focus:ring-white px-6 py-3">
                Create Free Account
              </Link>
              <Link to="/books" className="btn border border-white text-white hover:bg-primary-700 focus:ring-white px-6 py-3">
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;