import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        {/* Contact Section */}
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>
            <i className="fas fa-envelope"></i>
            <a href="mailto:info@ayurbot.com">info@ayurbot.com</a>
          </p>
          <p>
            <i className="fas fa-phone-alt"></i>
            <a href="tel:+911234567890">+91 1234567890</a>
          </p>
          <p>
  <i className="fas fa-map-marker-alt"></i>
  <a
    href="https://www.google.com/maps/dir//Survey+No.+189,+O.B.+Chordahalli,+Udayapura+Post,+Kanakapura+Road,+South,+Bengaluru,+Badamanavarathekaval,+Karnataka+560082/@12.8221624,77.439303,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bae41a95365695f:0xf44cc491a5662f1f!2m2!1d77.5217049!2d12.8221752?entry=ttu&g_ep=EgoyMDI1MDUwNS4wIKXMDSoASAFQAw%3D%3D"
    target="_blank"
    rel="noopener noreferrer"
  >
    Sri Sri Ayurveda Hospital, Bangalore
  </a>
</p>
<p>
  <i className="fas fa-map-marker-alt"></i>
  <a
    href="https://www.google.com/maps/dir//Ayush+Ayurveda,+Jayanagar,+Bangalore/@12.9061903,77.5162335,12z?entry=ttu&g_ep=EgoyMDI1MDUwNS4wIKXMDSoASAFQAw%3D%3D"
    target="_blank"
    rel="noopener noreferrer"
  >
    Ayush Ayurveda, Jayanagar, Bangalore
  </a>
</p>
<p>
  <i className="fas fa-map-marker-alt"></i>
  <a
    href="https://www.google.com/maps/dir//Patanjali+Chikitsalay,+Indiranagar,+Bangalore/@12.971446,77.5592995,12z?entry=ttu&g_ep=EgoyMDI1MDUwNS4wIKXMDSoASAFQAw%3D%3D"
    target="_blank"
    rel="noopener noreferrer"
  >
    Patanjali Chikitsalay, Indiranagar, Bangalore
  </a>
</p>
<p>
  <i className="fas fa-map-marker-alt"></i>
  <a
    href="https://www.google.com/maps/dir//Apollo+AyurVAID,+Domlur+%7C+Ayurveda+Hospital+in+Bangalore,+Domlur,+230,+off+Intermediate+Ring+Road,+near+Dell+India%2FMillennium+Motors,+Amarjyoti+Layout,+Domlur,+Bengaluru,+Karnataka+560071/@12.9552449,77.6016113,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bae140e2e8441b3:0xcdd38f295d34b2dc!2m2!1d77.6428113!2d12.9551645?entry=ttu&g_ep=EgoyMDI1MDUwNS4wIKXMDSoASAFQAw%3D%3D"
    target="_blank"
    rel="noopener noreferrer"
  >
    AyurVAID Hospitals, Domlur, Bangalore
  </a>
</p>

        </div>

        {/* Consultation Hours */}
        <div className="footer-section consultation">
          <h3>Consultation Hours</h3>
          <p><i className="fas fa-clock"></i> Mon - Fri: 9:00 AM – 6:00 PM</p>
          <p><i className="fas fa-clock"></i> Saturday: 9:00 AM – 2:00 PM</p>
          <p><i className="fas fa-clock"></i> Sunday: Closed</p>
        </div>

        {/* Social Media Links */}
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} <strong>AyurBot</strong>. All rights reserved.</p>
        <p><small>Licensed under Ministry of AYUSH, Government of India</small></p>
      </div>
    </footer>
  );
};

export default Footer;
