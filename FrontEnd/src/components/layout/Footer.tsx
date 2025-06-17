import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-700" />
              <span className="text-xl font-bold text-gray-900">
                Smart Library
              </span>
            </Link>
            <p className="text-gray-600 text-sm">
              Platform perpustakaan digital modern dengan fitur AI untuk
              pengalaman membaca yang lebih baik.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Menu Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/books"
                  className="text-gray-600 hover:text-primary-600 text-sm"
                >
                  Koleksi Buku
                </Link>
              </li>
              <li>
                <Link
                  to="/forum"
                  className="text-gray-600 hover:text-primary-600 text-sm"
                >
                  Forum Diskusi
                </Link>
              </li>
              <li>
                <Link
                  to="/borrow"
                  className="text-gray-600 hover:text-primary-600 text-sm"
                >
                  Peminjaman
                </Link>
              </li>
              <li>
                <Link
                  to="/ai"
                  className="text-gray-600 hover:text-primary-600 text-sm"
                >
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:info@smartlibrary.com"
                  className="hover:text-primary-600"
                >
                  info@smartlibrary.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <Phone className="h-4 w-4" />
                <a href="tel:+6281234567890" className="hover:text-primary-600">
                  +62 812 3456 7890
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-gray-600 text-sm mb-4">
              Dapatkan update terbaru tentang koleksi buku dan acara kami.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Berlangganan
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Smart Library. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-600 hover:text-primary-600 text-sm"
              >
                Syarat & Ketentuan
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary-600 text-sm"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary-600 text-sm"
              >
                FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
