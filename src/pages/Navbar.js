import React from 'react';
import './Navbar.css';

const Navbar = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">AyurBot</div>
      <div className="nav-links">
        <button onClick={() => scrollToSection('home')}>Home</button>
        <button onClick={() => scrollToSection('services')}>Services</button>
        <button onClick={() => scrollToSection('about')}>About</button>
      </div>
    </nav>
  );
};

export default Navbar;
