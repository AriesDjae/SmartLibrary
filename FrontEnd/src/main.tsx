import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { BookProvider } from './contexts/BookContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <BookProvider>
          <App />
        </BookProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);