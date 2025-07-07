import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '../components/dashboard-admin/ErrorBoundary';
import { ToastProvider } from '../components/dashboard-admin/Toast';
import { EnhancedSidebar } from '../components/dashboard-admin/EnhancedSidebar';
import { TopNavbar } from '../components/dashboard-admin/TopNavbar';
import { EnhancedDashboard } from '../components/dashboard-admin/EnhancedDashboard';
import { EnhancedAuthForm } from '../components/dashboard-admin/EnhancedAuthForm';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
// import { AdminProfilePage } from '../pages/AdminDashboardProfile';

const getRoleFromRoleId = (role_id?: string) => {
  if (!role_id) return 'member';
  // if (role_id === '1') return 'admin';
  if (role_id === '2') return 'admin';
  return 'member';
};

const AdminDashboardPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const { currentUser, isAuthenticated, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (currentUser && getRoleFromRoleId(currentUser.role_id) !== 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, navigate]);
  if (currentUser && getRoleFromRoleId(currentUser.role_id) === 'admin') {
    return null; // Jangan render apapun, tunggu redirect
  }

  if (!currentUser) {
    return (
      <ErrorBoundary>
        <ToastProvider>
          <EnhancedAuthForm
            isLoginMode={true}
            onLogin={async () => {}}
            onRegister={async () => {}}
            onToggleMode={() => {}}
          />
        </ToastProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme.mode}`}>
          <div className="flex min-h-screen">
            <EnhancedSidebar
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <div className="flex-1">
              <TopNavbar
                onToggleSidebar={toggleSidebar}
                user={currentUser}
                onLogout={signOut}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
              <main className="min-h-screen">
                <EnhancedDashboard activeTab={activeTab} />
              </main>
            </div>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default AdminDashboardPage; 