import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    age: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (!/^[a-zA-Z\s]{2,50}$/.test(value)) {
          error = 'Name should contain only letters and be 2-50 characters long';
        }
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone_number':
        if (!value) {
          error = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(value)) {
          error = 'Please enter a valid 10-digit phone number';
        }
        break;
      case 'age':
        const ageValue = parseInt(value);
        if (!value) {
          error = 'Age is required';
        } else if (isNaN(ageValue) || ageValue < 18 || ageValue > 100) {
          error = 'Age must be between 18 and 100';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  const handleRegistration = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const registrationData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        age: parseInt(formData.age),
        password: formData.password
      };

      const response = await axios.post('http://localhost:5000/register', registrationData);
      if (response.data.success) {
        const userEmail = formData.email;
        navigate('/verify-otp', { 
          state: { email: userEmail },
          replace: true 
        });
        setError('');
        setSuccessMessage('✅ OTP sent successfully! Please check your email.');
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/verify-otp', {
        email: formData.email,
        otp
      });
      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError('Invalid OTP');
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2 className="form-title">Create Account</h2>
        {successMessage && (
          <div className="success-message animate-success">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {!showOtpInput ? (
          <form onSubmit={handleRegistration}>
            <div className="form-group">
              <input
                type="text"
                name="full_name"
                className={`form-input ${formErrors.full_name ? 'error' : ''}`}
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              {formErrors.full_name && (
                <div className="error-message">{formErrors.full_name}</div>
              )}
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formErrors.email && (
                <div className="error-message">{formErrors.email}</div>
              )}
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone_number"
                className={`form-input ${formErrors.phone_number ? 'error' : ''}`}
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
              {formErrors.phone_number && (
                <div className="error-message">{formErrors.phone_number}</div>
              )}
            </div>
            <div className="form-group">
              <input
                type="number"
                name="age"
                className={`form-input ${formErrors.age ? 'error' : ''}`}
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="100"
                required
              />
              {formErrors.age && (
                <div className="error-message">{formErrors.age}</div>
              )}
            </div>
            <div className="form-group password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-input ${formErrors.password ? 'error' : ''}`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
              {formErrors.password && (
                <div className="error-message">{formErrors.password}</div>
              )}
            </div>
            <div className="form-group password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formErrors.confirmPassword && (
                <div className="error-message">{formErrors.confirmPassword}</div>
              )}
            </div>            <button 
              type="submit" 
              className={`submit-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting || !formData.full_name || !formData.email || !formData.phone_number || !formData.age || !formData.password || !formData.confirmPassword}
            >
              {isSubmitting ? '' : 'Register'}
            </button>
          </form>
        ) : (
          <div className="otp-section">
            <div className="otp-message animate-fade">
              <span className="checkmark">✓</span>
              <p>OTP has been sent to your email</p>
              <p className="email-highlight">{formData.email}</p>
            </div>
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="submit-button">
                Verify OTP
              </button>
            </form>
          </div>
        )}
        <div className="toggle-form">
          Already have an account? <Link to="/login" className="form-link">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;