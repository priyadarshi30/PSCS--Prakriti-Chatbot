import React from 'react';
import '../styles/About.css';

export const aboutContent = {
  title: "About Us",
  description: "AyurBot combines ancient Ayurvedic wisdom with modern AI technology to provide personalized wellness solutions. Our mission is to make Ayurvedic knowledge accessible and practical for everyone's daily life.",
  mission: {
    title: "Our Mission",
    text: "To democratize Ayurvedic wellness through technology"
  },
  values: {
    title: "Our Values",
    items: [
      "Authenticity in Ayurvedic principles",
      "Innovation in healthcare delivery",
      "Personalized user experience"
    ]
  }
};

const About = () => {
  const benefits = [
    {
      icon: '🎯',
      title: 'Precision',
      description: 'AI-powered analysis for accurate dosha assessment'
    },
    {
      icon: '🌟',
      title: 'Authenticity',
      description: 'Based on classical Ayurvedic texts and principles'
    },
    {
      icon: '🔄',
      title: 'Adaptability',
      description: 'Dynamic recommendations that evolve with your needs'
    }
  ];

  const achievements = [
    { number: '10,000+', label: 'Active Users' },
    { number: '95%', label: 'Satisfaction Rate' },
    { number: '50+', label: 'Expert Practitioners' },
    { number: '1000+', label: 'Successful Consultations' }
  ];

  const values = [
    {
      icon: '🌿',
      title: 'Traditional Wisdom',
      description: 'Rooted in authentic Ayurvedic principles from ancient texts'
    },
    {
      icon: '🤖',
      title: 'Modern Innovation',
      description: 'Leveraging cutting-edge AI for precise health analysis'
    },
    {
      icon: '🤝',
      title: 'Patient-Centric',
      description: 'Focused on delivering personalized care and support'
    },
    {
      icon: '📚',
      title: 'Continuous Learning',
      description: 'Constantly evolving with research and user feedback'
    }
  ];

  return (
    <div className="about-section" id="about">
      <div className="about-content">
        <div className="about-header">
          <p className="rev">Revolutionizing Ayurvedic Healthcare</p>
          <p className="ancient">Bridging Ancient Wisdom with Modern Technology</p>
        </div>

        {/* Benefits Section */}
        <h2>Why Choose AyurBot?</h2>
        <div className="about-intro">
          <p>
            AyurBot combines the timeless wisdom of Ayurveda with cutting-edge AI technology
            to provide personalized health insights and recommendations. Our platform makes
            ancient wellness practices accessible and practical for modern life.
          </p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div className="benefit-card" key={index}>
              <span className="benefit-icon">{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="achievements-section">
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div className="achievement-card" key={index}>
                <h2 className="achievement-number">{achievement.number}</h2>
                <p className="achievement-label">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="values-section">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div className="value-card" key={index}>
                <span className="value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section with Enhanced Design */}
        <div className="about-mission-enhanced">
          <div className="mission-content">
            <h2>Our Vision & Mission</h2>
            <p className="vision-statement">
              "To be the global leader in AI-powered Ayurvedic healthcare, making traditional wellness accessible to millions."
            </p>
            <div className="mission-points">
              <div className="mission-point">
                <span className="point-icon">🎯</span>
                <p>Democratize access to Ayurvedic wisdom</p>
              </div>
              <div className="mission-point">
                <span className="point-icon">💡</span>
                <p>Innovate healthcare through technology</p>
              </div>
              <div className="mission-point">
                <span className="point-icon">🌍</span>
                <p>Create global wellness impact</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
