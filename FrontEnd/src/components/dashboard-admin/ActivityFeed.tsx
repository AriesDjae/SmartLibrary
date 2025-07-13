import React from 'react';
import { Clock, User, BookOpen, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface ActivityFeedProps {
  activities: any[];
  loading: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading }) => {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'borrow':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'return':
        return <ArrowRight className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'borrow':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'return':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getActivityColor('borrow')} transition-all duration-200 hover:scale-105`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon('borrow')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.userName || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.bookTitle ? `borrowed "${activity.bookTitle}"` : 'borrowed a book'}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(activity.borrow_date)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Activities will appear here when users borrow books
            </p>
          </div>
        )}
      </div>
      
      {activities && activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            onClick={() => navigate('/admin/book-loans')}
          >
            View all activities
          </button>
        </div>
      )}
    </div>
  );
}; 