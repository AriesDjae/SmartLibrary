import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  User, 
  Home, 
  BookOpenText, 
  BarChart3, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, isAuthenticated, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary-900" />
          <span className="text-xl font-bold text-primary-900">Smart Library</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`flex items-center space-x-1 hover:text-primary-600 transition-colors ${
              isActivePath('/') ? 'text-primary-600 font-medium' : 'text-gray-700'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link 
            to="/books" 
            className={`flex items-center space-x-1 hover:text-primary-600 transition-colors ${
              isActivePath('/books') ? 'text-primary-600 font-medium' : 'text-gray-700'
            }`}
          >
            <BookOpenText className="h-4 w-4" />
            <span>Books</span>
          </Link>
          {isAuthenticated && (
            <Link 
              to="/dashboard" 
              className={`flex items-center space-x-1 hover:text-primary-600 transition-colors ${
                isActivePath('/dashboard') ? 'text-primary-600 font-medium' : 'text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex relative mx-4 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search for books, authors, or genres..."
            className="input py-1.5 pl-9 pr-4 text-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </form>
        
        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2 hover:text-primary-600 transition-colors">
                {currentUser?.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt={currentUser.name} 
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary-100"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                )}
                <span className="text-sm font-medium">{currentUser?.name}</span>
              </Link>
              <button 
                onClick={signOut}
                className="text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/sign-in" className="btn-outline py-1.5 text-sm">Sign In</Link>
              <Link to="/sign-up" className="btn-primary py-1.5 text-sm">Sign Up</Link>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center text-gray-700 hover:text-primary-600 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input py-2 pl-9 pr-4 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
              
              <nav className="space-y-2">
                <Link 
                  to="/" 
                  className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                    isActivePath('/') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link 
                  to="/books" 
                  className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                    isActivePath('/books') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <BookOpenText className="h-5 w-5" />
                  <span>Books</span>
                </Link>
                {isAuthenticated && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                        isActivePath('/dashboard') 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                        isActivePath('/profile') 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <button 
                      onClick={signOut}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md w-full text-left transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </nav>
              
              {!isAuthenticated && (
                <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
                  <Link to="/sign-in" className="btn-outline w-full">Sign In</Link>
                  <Link to="/sign-up" className="btn-primary w-full">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;