import { useState, useEffect } from 'react';
import { User, Book, Loan, Activity, Stats } from '../types';
import { mockUsers, mockBooks, mockLoans, mockActivities, mockStats } from '../utils/data';

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