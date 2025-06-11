import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book, Clock, BookOpen, ArrowUpRight } from 'lucide-react';
import StatisticsCard from '../components/dashboard/StatisticsCard';
import ReadingProgress from '../components/dashboard/ReadingProgress';
import ReadingChart from '../components/dashboard/ReadingChart';
import GenresPieChart from '../components/dashboard/GenresPieChart';
import { mockUserActivity } from '../data/mockData';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-8">Please sign in to view your dashboard.</p>
        <Link to="/sign-in" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Track your reading progress and insights</p>
        </div>
        <Link to="/books" className="btn-primary flex items-center">
          <span>Discover Books</span>
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatisticsCard 
          title="Books Completed" 
          value={mockUserActivity.readingStats.booksCompleted}
          icon={Book}
          color="bg-primary-600"
          change={{ value: 20, isPositive: true }}
        />
        <StatisticsCard 
          title="Reading Time" 
          value={`${mockUserActivity.readingStats.timeSpent} hours`}
          icon={Clock}
          color="bg-accent-600"
          change={{ value: 15, isPositive: true }}
        />
        <StatisticsCard 
          title="Pages Read" 
          value={mockUserActivity.readingStats.pagesRead}
          icon={BookOpen}
          color="bg-highlight-500"
          change={{ value: 8, isPositive: true }}
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Reading Progress */}
        <div className="lg:col-span-1">
          <ReadingProgress />
        </div>
        
        {/* Charts */}
        <div className="lg:col-span-2">
          <ReadingChart />
        </div>
      </div>
      
      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Genre Distribution */}
        <div>
          <GenresPieChart />
        </div>
        
        {/* Borrowing History */}
        <div className="card">
          <div className="border-b border-gray-100 p-4">
            <h3 className="font-semibold text-lg">Borrowing History</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {mockUserActivity.borrowHistory.map((item, index) => {
              const book = useBooks().getBookById(item.bookId);
              if (!book) return null;
              
              return (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-12 h-16 object-cover rounded shadow-sm mr-4"
                    />
                    <div>
                      <h4 className="font-medium">{book.title}</h4>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">Borrowed: </span>
                        <span className="text-xs ml-1">
                          {new Date(item.borrowDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'active' ? 'Active' : 'Returned'}
                    </span>
                    {item.status === 'active' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Due: {new Date(item.returnDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 bg-gray-50 rounded-b-lg text-center">
            <Link to="/books" className="text-primary-600 hover:text-primary-800 font-medium text-sm">
              Browse more books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;