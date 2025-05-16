import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import Services from './components/Services';
import Chatbot from './pages/Chatbot';
import NotFound from './components/NotFound';
import './App.css';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    const authState = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    return authState && !!userEmail && !!token;
  });

  React.useEffect(() => {
    const checkAuth = () => {
      const authState = localStorage.getItem('isAuthenticated') === 'true';
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      setIsAuthenticated(authState && !!userEmail && !!token);
    };

    // Check auth on mount and when storage changes
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth); // Custom event
    checkAuth();

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chatbot" element={<Chatbot />} />
          </Route>
          
          <Route path="/services" element={<Services />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;