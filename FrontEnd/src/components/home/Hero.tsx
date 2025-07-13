import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      localStorage.setItem('ai_initial_prompt', searchQuery.trim());
      navigate(`/ai?prompt=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-primary-900 to-primary-700 text-white w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center mb-4"
          >
            {/* <img src="/public/favicon.svg" alt="Smart Library" className="w-16 h-16 mb-2 drop-shadow-lg" /> */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">Discover a World of Knowledge</h1>
            <p className="text-lg md:text-xl mb-2 text-blue-100 font-medium">Perpustakaan digital dengan AI rekomendasi, koleksi lengkap, dan statistik bacaan personal.</p>
            <span className="text-base text-blue-200 mb-4">Belajar, membaca, dan berkembang—kapan saja, di mana saja.</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto mb-8"
            >
              <input
                type="text"
                placeholder="Tanyakan sesuatu ke AI..."
                className="w-full px-5 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-highlight-500 shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-700 hover:bg-primary-600 text-white p-2 rounded-full transition-colors"
              >
                <Search className="h-6 w-6" />
              </button>
            </form>
          </motion.div>

          {/* CTA Buttons
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="/sign-up"
              className="btn bg-white text-primary-800 hover:bg-blue-50 focus:ring-white px-6 py-3 font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
            >
              Mulai Sekarang
            </a>
            <a
              href="/books"
              className="btn border border-white text-white hover:bg-primary-600 focus:ring-white px-6 py-3 font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
            >
              Jelajahi Koleksi
            </a>
          </motion.div> */}
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 160"
          className="w-full h-auto"
        >
          <path
            fill="#F9FAFB"
            fillOpacity="1"
            d="M0,128L48,117.3C96,107,192,85,288,90.7C384,96,480,128,576,128C672,128,768,96,864,80C960,64,1056,64,1152,80C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
