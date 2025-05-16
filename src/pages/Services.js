import React from 'react';
import '../styles/Services.css';
import panchakarmaIcon from '../images/panchakarma.webp';
import dietIcon from '../images/diet.jpg';
import herbalIcon from '../images/herbal.png';
import consultationIcon from '../images/consultation.webp';

const fallbackImage = 'https://via.placeholder.com/150';

export const services = [
  {
    title: "Panchakarma Treatment",
    description: "Traditional cleansing and rejuvenation therapies including Vamana, Virechana, Basti, Nasya, and Raktamokshana",
    icon: panchakarmaIcon
  },
  {
    title: "Diet Consultation",
    description: "Personalized Ayurvedic diet plans with dosha-specific recommendations and seasonal guidelines",
    icon: dietIcon
  },
  {
    title: "Herbal Medicines",
    description: "Custom herbal formulations, classical Ayurvedic medicines, and therapeutic supplements",
    icon: herbalIcon
  },
  {
    title: "Consultation Services",
    description: "Comprehensive health consultations including pulse diagnosis, constitution analysis, and treatment planning",
    icon: consultationIcon
  }
];

const Services = () => {
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = fallbackImage;
  };

  return (
    <div className="services-section" id="services">
      <h2>Our Services</h2>
      <div className="services-grid">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">
              <img 
                src={service.icon} 
                alt={service.title}
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
