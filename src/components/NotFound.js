import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1b1e, #2c2d30)',
      color: '#fff'
    }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist.</p>
      <Link 
        to="/"
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#3498db',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
