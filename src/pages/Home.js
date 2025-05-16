import React from 'react';
import '../styles/Hero.css';
import image from '../images/logo.jpg';
import Header from './Header';
import Services from './Services';
import About from './About';
import Footer from './Footer';

const Hero = () => {
  return (
    <>
      <Header />
      <div className="hero-container">
        <section className="main-hero">
          <div className="hero-content">
            <p className="tagline">
              <span>❤️</span>
              Health comes first
            </p>
            <h1>AyurBot: Personalized Ayurvedic Wellness Chatbot</h1>
            <p className="description">
              Discover Your Ayurvedic Balance: Experience our AI-driven chatbot that determines your Prakriti and offers personalized dietary guidance for holistic well-being.
            </p>            <div className="wellness-features">
              <div className="feature">
                <span className="feature-icon">🌿</span>
                <h3>Personalized Care</h3>
                <p>Tailored Ayurvedic recommendations for your unique constitution</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🧘</span>
                <h3>Holistic Approach</h3>
                <p>Balance of mind, body, and spirit through ancient wisdom</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🌟</span>
                <h3>Modern Analysis</h3>
                <p>AI-powered insights combined with traditional Ayurvedic principles</p>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img src={image} alt="Ayurvedic Wellness" loading="eager" />
          </div>
        </section>
        
        <Services />
        <About />
        <Footer />
      </div>
    </>
  );
};

export default Hero;