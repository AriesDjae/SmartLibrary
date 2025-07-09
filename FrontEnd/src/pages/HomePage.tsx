import React, { useEffect } from "react";
import Hero from "../components/home/Hero";
import BookCarousel from "../components/books/BookCarousel";
import { useBooks } from "../contexts/BookContext";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const { featuredBooks, popularBooks, newArrivals, getUserRecommendations } =
    useBooks();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  const recommendations = isAuthenticated ? getUserRecommendations() : [];

  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // Mapping role_id ke role (contoh sederhana, sesuaikan dengan backend jika perlu)
  const getRoleFromRoleId = (role_id?: string) => {
    if (!role_id) return "member";
    if (role_id === "1") return "admin";
    if (role_id === "2") return "librarian";
    return "member";
  };

  useEffect(() => {
    if (currentUser && getRoleFromRoleId(currentUser.role_id) === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hapus Header/navbar, hanya tampilkan Hero dan konten utama */}
      <Hero />
      <div className="container mx-auto px-4 py-12">
        {/* Featured Books */}
        <div className="mb-12">
          <BookCarousel
            title="Buku Unggulan"
            books={featuredBooks}
            description="Pilihan buku terbaik untuk Anda, dikurasi oleh tim kami."
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
            <h2 className="text-3xl font-bold mb-4">
              Kenapa Pilih Smart Library?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Perpustakaan digital modern dengan AI rekomendasi, koleksi
              lengkap, dan statistik bacaan personal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={itemVariants}
              className="card p-6 text-center"
            >
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                <Sparkles className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rekomendasi AI</h3>
              <p className="text-gray-600">
                Temukan buku sesuai minat Anda dengan mesin rekomendasi cerdas.
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="card p-6 text-center"
            >
              <div className="inline-flex items-center justify-center p-3 bg-teal-100 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-accent-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Koleksi Lengkap</h3>
              <p className="text-gray-600">
                Ribuan buku dari berbagai genre, mulai dari fiksi hingga
                referensi akademik.
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="card p-6 text-center"
            >
              <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4">
                <TrendingUp className="h-6 w-6 text-highlight-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Statistik Membaca</h3>
              <p className="text-gray-600">
                Pantau progres dan kebiasaan membaca Anda secara personal.
              </p>
            </motion.div>
          </div>
        </motion.section>
        {/* CTA Section */}
        <div className="my-16 bg-gradient-to-r from-primary-800 to-primary-900 rounded-xl text-white p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Siap Mulai Membaca?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Gabung bersama ribuan pembaca yang sudah menikmati Smart Library.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/sign-up"
                className="btn bg-white text-primary-800 hover:bg-blue-50 focus:ring-white px-6 py-3"
              >
                Daftar Gratis
              </Link>
              <Link
                to="/books"
                className="btn border border-white text-white hover:bg-primary-700 focus:ring-white px-6 py-3"
              >
                Jelajahi Koleksi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
