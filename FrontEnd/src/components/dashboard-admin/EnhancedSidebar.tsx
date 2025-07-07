import React from 'react';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  User,
  Users,
  Calendar,
  BookMarked,
  X,
  Settings,
  HelpCircle
} from 'lucide-react';

interface EnhancedSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'home', label: 'Dashboard', icon: Home, description: 'Overview & Analytics' },
  { id: 'collections', label: 'Collections', icon: BookOpen, description: 'Manage Books' },
  { id: 'dashboard', label: 'Analytics', icon: BarChart3, description: 'Reports & Insights' },
  { id: 'book-loans', label: 'Loans', icon: Calendar, description: 'Track Borrowing' },
  { id: 'account', label: 'Users', icon: Users, description: 'User Management' },
  { id: 'forum', label: 'Community', icon: User, description: 'Forums & Discussions' },
];

const bottomMenuItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange
}) => {
  return (
    <>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-20 lg:hidden ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={onToggle} />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 min-h-screen w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-30 lg:translate-x-0 lg:static lg:shadow-lg ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">Smart Library</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button 
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <IconComponent className={`mr-3 w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  } ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  
                  <div className="flex-1 text-left">
                    <div className="transition-all duration-200">{item.label}</div>
                    {!isActive && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                        {item.description}
                      </div>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Menu Items */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {bottomMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent className={`mr-3 w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                    <span className="transition-all duration-200">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer - Reading Goal */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">System Health</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">All systems operational</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">95% uptime this month</p>
          </div>
        </div>
      </div>
    </>
  );
};