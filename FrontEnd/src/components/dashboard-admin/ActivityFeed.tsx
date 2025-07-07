import React from 'react';
import { Clock, BookOpen, UserPlus, RotateCcw, Heart, MessageSquare } from 'lucide-react';
import { Activity } from '../../types';
import { ActivitySkeleton } from './LoadingStates';

interface ActivityFeedProps {
  activities: Activity[];
  loading: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'borrow':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'return':
        return <RotateCcw className="w-4 h-4 text-green-600" />;
      case 'reserve':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'review':
        return <Heart className="w-4 h-4 text-red-600" />;
      case 'register':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'borrow':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'return':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'reserve':
        return 'bg-orange-100 dark:bg-orange-900/20';
      case 'review':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'register':
        return 'bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return <ActivitySkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-lg transition-colors duration-200">
            <div className={`p-2 rounded-full ${getActivityColor(activity.type)} group-hover:scale-110 transition-transform duration-200`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {activity.user.avatar && (
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.user.name}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {activity.description}
              </p>

              {activity.book && (
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={activity.book.cover}
                    alt={activity.book.title}
                    className="w-8 h-12 object-cover rounded"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-500">{activity.book.title}</span>
                </div>
              )}
              
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">No recent activity to display.</div>
        </div>
      )}
    </div>
  );
}; 