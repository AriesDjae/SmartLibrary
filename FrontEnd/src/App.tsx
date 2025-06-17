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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BorrowProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BookCollectionPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/create" element={<CreateDiscussionPage />} />
            <Route path="/forum/:id" element={<DiscussionDetailPage />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/reader/:id" element={<ReaderPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BorrowProvider>
    </AuthProvider>
  );
};

export default App;
