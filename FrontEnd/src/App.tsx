import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { BorrowProvider } from "./contexts/BorrowContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import BookCollectionPage from "./pages/BookCollectionPage";
import BookDetailPage from "./pages/BookDetailPage";
import ForumPage from "./pages/ForumPage";
import DiscussionDetailPage from "./pages/DiscussionDetailPage";
import CreateDiscussionPage from "./pages/CreateDiscussionPage";
import AiPage from "./pages/AiPage";
import BorrowPage from "./pages/BorrowPage";
import ProfilePage from "./pages/ProfilePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ReaderPage from "./pages/ReaderPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import ProtectedProfile from "./pages/ProtectedProfile";
import RequireAdmin from './routes/RequireAdmin';
import RequireUser from './routes/RequireUser';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BorrowProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#fff',
              color: '#22223b',
              fontWeight: 500,
              fontSize: '1rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              padding: '16px 24px',
              border: '1px solid #e0e7ef',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Admin Dashboard tanpa Layout global */}
          <Route path="/admin" element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          } />
          <Route path="/admin/profile" element={
            <RequireAdmin>
              <AdminProfilePage />
            </RequireAdmin>
          } />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={
              <RequireUser>
                <HomePage />
              </RequireUser>
            } />
            <Route path="/books" element={<BookCollectionPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/create" element={<CreateDiscussionPage />} />
            <Route path="/forum/:id" element={<DiscussionDetailPage />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/profile" element={<ProtectedProfile />} />
            <Route path="/reader/:id" element={<ReaderPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BorrowProvider>
    </AuthProvider>
  );
};

export default App;
