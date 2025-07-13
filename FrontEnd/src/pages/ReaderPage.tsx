import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../services/axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Bookmark, 
  Maximize2, 
  Minimize2,
  Settings,
  Type,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById } = useBooks();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const book = getBookById(id || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [showControls, setShowControls] = useState(true);
  
  // Debouncing dan throttling untuk mencegah terlalu banyak request
  const progressTimeoutRef = useRef<number | null>(null);
  const lastSentProgress = useRef<number>(0);
  const lastRequestTime = useRef<number>(0);
  
  // Simulate book content loading
  useEffect(() => {
    if (book) {
      setTotalPages(book.pageCount);
    }
  }, [book]);

  // Fungsi untuk update progress ke backend dengan debouncing dan throttling
  const sendProgress = useCallback(async (page: number) => {
    if (!currentUser?._id || !id) return;
    
    // Jangan kirim jika progress sama dengan yang terakhir dikirim
    if (page === lastSentProgress.current) return;
    
    // Throttling: minimal 1 detik antara request
    const now = Date.now();
    if (now - lastRequestTime.current < 1000) {
      return;
    }
    
    // Clear timeout sebelumnya jika ada
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    
    // Set timeout baru - kirim progress setelah 2 detik tidak ada perubahan
    progressTimeoutRef.current = setTimeout(async () => {
      try {
        const progress = page / totalPages; // misal: 0.55 untuk 55%
        await axiosInstance.post("/user-interactions", {
          user_id: currentUser._id,
          book_id: id,
          interaction_type: "read",
          progress, // <-- progress dikirim ke backend
          timestamp: new Date().toISOString(),
          interaction_details: `Read page ${page} of ${totalPages}`
        });
        
        // Update last sent progress dan waktu request
        lastSentProgress.current = page;
        lastRequestTime.current = Date.now();
        console.log(`Progress sent: ${Math.round(progress * 100)}% (page ${page}/${totalPages})`);
      } catch (error) {
        console.error('Error sending progress:', error);
        // Tidak perlu show toast error karena ini background process
      }
    }, 2000); // Delay 2 detik
  }, [currentUser?._id, id, totalPages]);

  // Kirim progress saat pertama kali masuk ke reader (halaman 1)
  useEffect(() => {
    if (
      book &&
      currentUser?._id &&
      id &&
      totalPages > 1 // pastikan totalPages sudah benar
    ) {
      const sendInitialProgress = async () => {
        try {
          const progress = 1 / totalPages;
          await axiosInstance.post("/user-interactions", {
            user_id: currentUser._id,
            book_id: id,
            interaction_type: "read",
            progress,
            timestamp: new Date().toISOString(),
            interaction_details: `Started reading - page 1 of ${totalPages}`,
          });
          lastSentProgress.current = 1;
          console.log(`Initial progress sent: ${Math.round(progress * 100)}%`);
        } catch (error) {
          console.error("Error sending initial progress:", error);
        }
      };
      sendInitialProgress();
    }
  }, [book, currentUser, id, totalPages]);
  
  // Cleanup timeout saat component unmount
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);
  
  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
          <button 
            className="btn-primary"
            onClick={() => navigate('/books')}
          >
            Return to Collection
          </button>
        </div>
      </div>
    );
  }
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      sendProgress(newPage); // Kirim progress ke backend
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      sendProgress(newPage); // Kirim progress ke backend
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const changeFontSize = (size: number) => {
    setFontSize(Math.max(12, Math.min(24, size)));
  };
  
  const toggleTheme = (newTheme: 'light' | 'sepia' | 'dark') => {
    setTheme(newTheme);
  };
  
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  // Determine theme background and text colors
  const themeStyles = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-amber-50 text-gray-900',
    dark: 'bg-gray-900 text-gray-100'
  };
  
  return (
    <div 
      className={`min-h-screen flex flex-col ${themeStyles[theme]}`}
      onClick={toggleControls}
    >
      {/* Reader Toolbar */}
      {showControls && (
        <div className={`py-3 px-4 flex items-center justify-between border-b ${
          theme === 'dark' ? 'border-gray-800 bg-gray-900' : 
          theme === 'sepia' ? 'border-amber-200 bg-amber-50' : 
          'border-gray-200 bg-white'
        }`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/books');
            }}
            className={`rounded-full p-2 ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h1 className="font-medium text-sm sm:text-base truncate max-w-xs sm:max-w-md mx-auto">
              {book.title}
            </h1>
            <p className="text-xs text-gray-500">{book.author}</p>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleSettings();
              }}
              className={`rounded-full p-2 ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
            </button>
            {/* Tombol Ringkas */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast('Fitur ringkas akan segera tersedia.', {
                  icon: '✨',
                  style: {
                    borderRadius: '8px',
                    background: theme === 'dark' ? '#22223b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#22223b',
                    fontWeight: '500',
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                  },
                  duration: 2500
                });
              }}
              className={`rounded-full p-2 ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              title="Ringkas Buku"
            >
              <span className="font-semibold text-xs">Ringkas</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className={`rounded-full p-2 ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Reader Content */}
      <div className="flex-grow flex">
        {/* Previous Page Button */}
        {showControls && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
            className={`hidden sm:flex items-center justify-center w-16 ${
              currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        
        {/* Book Content */}
        <div 
          className="flex-grow px-6 py-8 overflow-auto"
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Chapter {currentPage}</h2>
              {/* Simulated book content */}
              <p className="mb-4 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget urna consectetur ultrices. 
                Fusce auctor, nisl eget ultricies tincidunt, nisl nunc fermentum metus, eget ultricies nunc nunc eget erat.
                Praesent vitae enim euismod, ultricies nunc eget, ultricies nunc. Sed vitae eros eget urna consectetur ultrices.
              </p>
              <p className="mb-4 leading-relaxed">
                Etiam eget felis eget urna consectetur ultrices. Fusce auctor, nisl eget ultricies tincidunt, nisl nunc fermentum metus, 
                eget ultricies nunc nunc eget erat. Praesent vitae enim euismod, ultricies nunc eget, ultricies nunc. Sed vitae eros 
                eget urna consectetur ultrices.
              </p>
              <p className="mb-4 leading-relaxed">
                Mauris eget felis eget urna consectetur ultrices. Fusce auctor, nisl eget ultricies tincidunt, nisl nunc fermentum metus, 
                eget ultricies nunc nunc eget erat. Praesent vitae enim euismod, ultricies nunc eget, ultricies nunc. Sed vitae eros 
                eget urna consectetur ultrices.
              </p>
              <p className="mb-4 leading-relaxed">
                Donec auctor, nisl eget ultricies tincidunt, nisl nunc fermentum metus, eget ultricies nunc nunc eget erat.
                Praesent vitae enim euismod, ultricies nunc eget, ultricies nunc. Sed vitae eros eget urna consectetur ultrices.
                Mauris eget felis eget urna consectetur ultrices.
              </p>
              <p className="leading-relaxed">
                Vestibulum eget urna consectetur ultrices. Fusce auctor, nisl eget ultricies tincidunt, nisl nunc fermentum metus, 
                eget ultricies nunc nunc eget erat. Praesent vitae enim euismod, ultricies nunc eget, ultricies nunc. 
                Sed vitae eros eget urna consectetur ultrices.
              </p>
            </div>
          </div>
        </div>
        
        {/* Next Page Button */}
        {showControls && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              nextPage();
            }}
            className={`hidden sm:flex items-center justify-center w-16 ${
              currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>
      
      {/* Mobile Page Controls */}
      {showControls && (
        <div className={`sm:hidden grid grid-cols-2 gap-4 p-4 border-t ${
          theme === 'dark' ? 'border-gray-800 bg-gray-900' : 
          theme === 'sepia' ? 'border-amber-200 bg-amber-50' : 
          'border-gray-200 bg-white'
        }`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
            className={`btn ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700'
            } ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              nextPage();
            }}
            className={`btn ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700'
            } ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      )}
      
      {/* Bottom Status Bar */}
      {showControls && (
        <div 
          className={`p-4 flex items-center justify-between text-sm border-t ${
            theme === 'dark' ? 'border-gray-800 bg-gray-900' : 
            theme === 'sepia' ? 'border-amber-200 bg-amber-50' : 
            'border-gray-200 bg-white'
          }`}
        >
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
              {Math.round((currentPage / totalPages) * 100)}% Complete
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Add bookmark functionality
              }}
              className={`p-1 rounded ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              title="Bookmark this page"
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <div 
          className={`absolute top-14 right-4 w-64 rounded-lg shadow-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 
            theme === 'sepia' ? 'bg-amber-50 border-amber-200' : 
            'bg-white border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <h3 className="font-medium mb-3">Reader Settings</h3>
            
            <div className="space-y-4">
              {/* Font Size Controls */}
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => changeFontSize(fontSize - 2)}
                    className={`p-1 rounded ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    disabled={fontSize <= 12}
                  >
                    <Type className="h-4 w-4" />
                  </button>
                  <div className="flex-grow mx-2 h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-1 bg-primary-600 rounded-full" 
                      style={{ width: `${((fontSize - 12) / 12) * 100}%` }}
                    ></div>
                  </div>
                  <button 
                    onClick={() => changeFontSize(fontSize + 2)}
                    className={`p-1 rounded ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    disabled={fontSize >= 24}
                  >
                    <Type className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Theme Controls */}
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <div className="flex justify-between">
                  <button 
                    onClick={() => toggleTheme('light')}
                    className={`flex-1 p-2 rounded flex flex-col items-center ${
                      theme === 'light' 
                        ? 'bg-primary-100 text-primary-700' 
                        : theme === 'dark' ? 'text-gray-400' : ''
                    }`}
                  >
                    <Sun className="h-5 w-5 mb-1" />
                    <span className="text-xs">Light</span>
                  </button>
                  <button 
                    onClick={() => toggleTheme('sepia')}
                    className={`flex-1 p-2 rounded flex flex-col items-center ${
                      theme === 'sepia' 
                        ? 'bg-primary-100 text-primary-700' 
                        : theme === 'dark' ? 'text-gray-400' : ''
                    }`}
                  >
                    <Menu className="h-5 w-5 mb-1" />
                    <span className="text-xs">Sepia</span>
                  </button>
                  <button 
                    onClick={() => toggleTheme('dark')}
                    className={`flex-1 p-2 rounded flex flex-col items-center ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-300' 
                        : ''
                    }`}
                  >
                    <Moon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReaderPage;