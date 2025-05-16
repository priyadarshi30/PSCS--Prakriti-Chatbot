import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">AyurBot</Link>
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <Link to="/login" className="login-btn">Login</Link>
      </nav>
    </header>
  );
};

export default Header;
