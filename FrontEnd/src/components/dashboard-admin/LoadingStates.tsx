import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ActivitySkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
    <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-1">
            <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const BookCarouselSkeleton: React.FC = () => (
  <div className="flex space-x-4 overflow-hidden">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-48 animate-pulse">
        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
); 