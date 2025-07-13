import { useState, useEffect } from 'react';
import { User, Book, Loan, Activity, Stats } from '../types';
import { mockUsers, mockBooks, mockLoans, mockActivities, mockStats } from '../utils/data';
import { booksAPI, userAPI, borrowingAPI } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, status } : user
      )
    );
  };

  return { users, loading, updateUserStatus };
};

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooks(mockBooks);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return { books, loading };
};

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoans(mockLoans);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const updateLoanStatus = (loanId: string, status: Loan['status']) => {
    setLoans(prev => 
      prev.map(loan => 
        loan.id === loanId ? { ...loan, status } : loan
      )
    );
  };

  return { loans, loading, updateLoanStatus };
};

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { activities, loading };
};

export const useStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
}; 

export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<any>({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueBooks: 0,
    monthlyReads: 0,
    avgReadingTime: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      let newStats: any = {};
      
      try {
        const [totalBooksRes, totalUsersRes, activeLoansRes, overdueBooksRes, monthlyReadsRes, avgReadingTimeRes, recentActivitiesRes] = await Promise.allSettled([
          booksAPI.getTotalCount(),
          userAPI.getTotalNonAdmin(),
          borrowingAPI.getActiveCount(),
          borrowingAPI.getOverdueCount(),
          borrowingAPI.getMonthlyCount(),
          userAPI.getAvgReadingTime(),
          borrowingAPI.getRecentActivities()
        ]);
        
        if (!isMounted) return;
        
        // Helper to get value from .data.count or .count
        const getCount = (res: any) => res?.data?.count ?? res?.count ?? 0;
        const getAvg = (res: any) => res?.data?.avg ?? res?.avg ?? 0;
        const getActivities = (res: any) => res?.data?.activities ?? res?.activities ?? [];
        
        newStats.totalBooks = totalBooksRes.status === 'fulfilled' ? getCount(totalBooksRes.value) : 0;
        newStats.totalUsers = totalUsersRes.status === 'fulfilled' ? getCount(totalUsersRes.value) : 0;
        newStats.activeLoans = activeLoansRes.status === 'fulfilled' ? getCount(activeLoansRes.value) : 0;
        newStats.overdueBooks = overdueBooksRes.status === 'fulfilled' ? getCount(overdueBooksRes.value) : 0;
        newStats.monthlyReads = monthlyReadsRes.status === 'fulfilled' ? getCount(monthlyReadsRes.value) : 0;
        newStats.avgReadingTime = avgReadingTimeRes.status === 'fulfilled' ? getAvg(avgReadingTimeRes.value) : 0;
        let activitiesArr = recentActivitiesRes.status === 'fulfilled' ? getActivities(recentActivitiesRes.value) : [];
        activitiesArr = activitiesArr.map((activity: any) => ({
          ...activity,
          userName: activity.user?.username || activity.user?.name || activity.userName || 'Unknown User',
          bookTitle: activity.book?.title || activity.bookTitle || '',
        }));
        newStats.recentActivities = activitiesArr;
        
        if (isMounted) {
          setStats(newStats);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch dashboard stats');
          setStats({
            totalBooks: 0,
            totalUsers: 0,
            activeLoans: 0,
            overdueBooks: 0,
            monthlyReads: 0,
            avgReadingTime: 0,
            recentActivities: []
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  return { stats, loading, error };
}; 

export const useTotalBooks = () => {
  const [totalBooks, setTotalBooks] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await booksAPI.getTotalCount();
        setTotalBooks(response.data.count);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch total books');
        setTotalBooks(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTotalBooks();
  }, []);

  return { totalBooks, loading, error };
}; 