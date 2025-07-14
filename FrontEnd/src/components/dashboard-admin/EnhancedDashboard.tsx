import React, { useState, useEffect } from 'react';
import { StatsCards } from './StatsCards';
import { FeaturedBooks } from './FeaturedBooks';
import { ActivityFeed } from './ActivityFeed';
import { Analytics } from './Analytics';
import { BookLoans } from './BookLoans';
import { useUsers, useBooks, useLoans, useActivities, useAdminDashboardStats } from '../../hooks/useData';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Settings, Download, Filter, Calendar } from 'lucide-react';

interface EnhancedDashboardProps {
  activeTab: string;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ activeTab }) => {
  const { users } = useUsers();
  const { books, loading: booksLoading } = useBooks();
  const { loans, loading: loansLoading, updateLoanStatus } = useLoans();
  const { stats, loading: statsLoading } = useAdminDashboardStats();
  const { handleAsyncOperation } = useErrorHandler();

  const [dateRange, setDateRange] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would trigger data refetch
      // console.log('Refreshing dashboard data...');
    }, 30000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleExportData = async () => {
    await handleAsyncOperation(async () => {
      // Simulate export functionality
      const data = {
        stats,
        users: users.length,
        books: books.length,
        loans: loans.length,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'export-data');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Library Dashboard
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Comprehensive overview of your digital library system
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                
                <button
                  onClick={handleExportData}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <StatsCards stats={stats} loading={statsLoading} />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <FeaturedBooks books={books} loading={booksLoading} />
                
                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
                    </button>
                    
                    <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 text-center">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Filter className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Filters</span>
                    </button>
                    
                    <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 text-center">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule</span>
                    </button>
                    
                    <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200 text-center">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Download className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Reports</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <ActivityFeed activities={stats?.recentActivities || []} loading={statsLoading} />
              </div>
            </div>
          </div>
        );
      
      case 'collections':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Book Collections</h2>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 font-medium">
                Add New Book
              </button>
            </div>
            <FeaturedBooks books={books} loading={booksLoading} />
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
              <button 
                onClick={handleExportData}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 font-medium"
              >
                Export Report
              </button>
            </div>
            <Analytics stats={stats} loading={statsLoading} />
          </div>
        );
      
      case 'book-loans':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Book Loans Management</h2>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 font-medium">
                New Loan
              </button>
            </div>
            <BookLoans loans={loans} loading={loansLoading} onUpdateStatus={updateLoanStatus} />
          </div>
        );
      
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This section is under development. Content will be available soon.
            </p>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {renderContent()}
    </div>
  );
}; 