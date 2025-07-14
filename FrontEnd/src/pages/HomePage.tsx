import React, { useEffect } from 'react';
import Hero from '../components/home/Hero';
import BookCarousel from '../components/books/BookCarousel';
import { useBooks } from '../contexts/BookContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { featuredBooks, popularBooks, newArrivals, getUserRecommendations } = useBooks();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
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
  
  // Mapping role_id ke role (contoh sederhana, sesuaikan dengan backend jika perlu)
  const getRoleFromRoleId = (role_id?: string) => {
    if (!role_id) return 'member';
    if (role_id === '1') return 'admin';
    if (role_id === '2') return 'librarian';
    return 'member';
  };

  useEffect(() => {
    if (currentUser && getRoleFromRoleId(currentUser.role_id) === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Hero />
      {/* Education News Section */}
      <section className="container mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-primary-800">Berita Pendidikan</h2>
        <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
          {/* Example news items, replace with dynamic fetch if needed */}
          <div className="min-w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
            <div className="flex gap-3 items-start mb-2">
              <img src="https://img.freepik.com/free-vector/flat-design-education-logo-template_23-2149491502.jpg?w=60" alt="Kurikulum Merdeka" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Kurikulum Merdeka Resmi Diterapkan Nasional</h3>
                <p className="text-gray-600 text-sm">Pemerintah mengumumkan penerapan Kurikulum Merdeka di seluruh sekolah mulai tahun ajaran baru. Kurikulum ini diharapkan mendorong kreativitas dan kemandirian siswa.</p>
              </div>
            </div>
            <a href="https://www.kemdikbud.go.id/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm font-medium mt-auto">Baca selengkapnya</a>
          </div>
          <div className="min-w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
            <div className="flex gap-3 items-start mb-2">
              <img src="https://img.freepik.com/free-vector/flat-design-scholarship-logo-template_23-2149491506.jpg?w=60" alt="Beasiswa Pendidikan" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Beasiswa Pendidikan 2024 Dibuka</h3>
                <p className="text-gray-600 text-sm">Pendaftaran beasiswa pendidikan untuk pelajar dan mahasiswa tahun 2024 telah dibuka. Segera cek persyaratan dan jadwal seleksi.</p>
              </div>
            </div>
            <a href="https://beasiswa.kemdikbud.go.id/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm font-medium mt-auto">Baca selengkapnya</a>
          </div>
          <div className="min-w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
            <div className="flex gap-3 items-start mb-2">
              <img src="https://img.freepik.com/free-vector/flat-design-online-education-logo-template_23-2149491504.jpg?w=60" alt="Tips Belajar Efektif" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Tips Belajar Efektif di Era Digital</h3>
                <p className="text-gray-600 text-sm">Simak tips dan strategi belajar efektif memanfaatkan teknologi digital agar prestasi akademik semakin meningkat.</p>
              </div>
            </div>
            <a href="https://edukasi.kompas.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm font-medium mt-auto">Baca selengkapnya</a>
          </div>
        </div>
      </section>
      
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
    </div>
  );
};

export default HomePage;











// import React, { useEffect } from "react";
// import Hero from "../components/home/Hero";
// import BookCarousel from "../components/books/BookCarousel";
// import { useBooks } from "../contexts/BookContext";
// import { useAuth } from "../contexts/AuthContext";
// import { CheckCircle, TrendingUp, Sparkles } from "lucide-react";
// import { motion } from "framer-motion";
// import { Link, useNavigate } from "react-router-dom";

// const HomePage: React.FC = () => {
//   const { featuredBooks, popularBooks, newArrivals, getUserRecommendations } =
//     useBooks();
//   const { isAuthenticated, currentUser } = useAuth();
//   const navigate = useNavigate();

//   const recommendations = isAuthenticated ? getUserRecommendations() : [];

//   // Animation variants for staggered animation
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.3,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6 },
//     },
//   };

//   // Mapping role_id ke role (contoh sederhana, sesuaikan dengan backend jika perlu)
//   const getRoleFromRoleId = (role_id?: string) => {
//     if (!role_id) return "member";
//     if (role_id === "1") return "admin";
//     if (role_id === "2") return "librarian";
//     return "member";
//   };

//   useEffect(() => {
//     if (currentUser && getRoleFromRoleId(currentUser.role_id) === "admin") {
//       navigate("/admin", { replace: true });
//     }
//   }, [currentUser, navigate]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hapus Header/navbar, hanya tampilkan Hero dan konten utama */}
//       <Hero />
//       <div className="container mx-auto px-4 py-12">
//         {/* Featured Books */}
//         <div className="mb-12">
//           <BookCarousel
//             title="Buku Unggulan"
//             books={featuredBooks}
//             description="Pilihan buku terbaik untuk Anda, dikurasi oleh tim kami."
//           />
//         </div>
//         {/* Why Choose Us Section */}
//         <motion.section
//           className="py-12"
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, margin: "-100px" }}
//           variants={containerVariants}
//         >
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-4">
//               Kenapa Pilih Smart Library?
//             </h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Perpustakaan digital modern dengan AI rekomendasi, koleksi
//               lengkap, dan statistik bacaan personal.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <motion.div
//               variants={itemVariants}
//               className="card p-6 text-center"
//             >
//               <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
//                 <Sparkles className="h-6 w-6 text-primary-700" />
//               </div>
//               <h3 className="text-xl font-semibold mb-3">Rekomendasi AI</h3>
//               <p className="text-gray-600">
//                 Temukan buku sesuai minat Anda dengan mesin rekomendasi cerdas.
//               </p>
//             </motion.div>
//             <motion.div
//               variants={itemVariants}
//               className="card p-6 text-center"
//             >
//               <div className="inline-flex items-center justify-center p-3 bg-teal-100 rounded-full mb-4">
//                 <CheckCircle className="h-6 w-6 text-accent-700" />
//               </div>
//               <h3 className="text-xl font-semibold mb-3">Koleksi Lengkap</h3>
//               <p className="text-gray-600">
//                 Ribuan buku dari berbagai genre, mulai dari fiksi hingga
//                 referensi akademik.
//               </p>
//             </motion.div>
//             <motion.div
//               variants={itemVariants}
//               className="card p-6 text-center"
//             >
//               <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4">
//                 <TrendingUp className="h-6 w-6 text-highlight-700" />
//               </div>
//               <h3 className="text-xl font-semibold mb-3">Statistik Membaca</h3>
//               <p className="text-gray-600">
//                 Pantau progres dan kebiasaan membaca Anda secara personal.
//               </p>
//             </motion.div>
//           </div>
//         </motion.section>
//         {/* CTA Section */}
//         <div className="my-16 bg-gradient-to-r from-primary-800 to-primary-900 rounded-xl text-white p-8 md:p-12">
//           <div className="max-w-3xl mx-auto text-center">
//             <h2 className="text-3xl font-bold mb-4">Siap Mulai Membaca?</h2>
//             <p className="text-lg text-blue-100 mb-8">
//               Gabung bersama ribuan pembaca yang sudah menikmati Smart Library.
//             </p>
//             <div className="flex flex-wrap justify-center gap-4">
//               <Link
//                 to="/sign-up"
//                 className="btn bg-white text-primary-800 hover:bg-blue-50 focus:ring-white px-6 py-3"
//               >
//                 Daftar Gratis
//               </Link>
//               <Link
//                 to="/books"
//                 className="btn border border-white text-white hover:bg-primary-700 focus:ring-white px-6 py-3"
//               >
//                 Jelajahi Koleksi
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;
