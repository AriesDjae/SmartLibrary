import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/reader');
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isReaderPage && <Header />}
      <main className={`flex-grow ${!isReaderPage ? 'pt-16 md:pt-20' : ''}`}>
        <Outlet />
      </main>
      {!isReaderPage && <Footer />}
    </div>
  );
};

export default Layout;