import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/OTPVerification.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(90);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOTP(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) return;

    try {
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString })
      });
      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage('✅ OTP verification successful!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setIsSuccess(false);
        setMessage('❌ Invalid OTP. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('❌ Server error. Please try again later.');
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch('http://localhost:5000/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('New OTP has been sent to your email!');
        setTimer(90); // Reset timer
        setOTP(['', '', '', '', '', '']); // Clear OTP input
        inputRefs.current[0]?.focus();
      } else {
        setMessage(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setMessage('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="otp-container">
      <div className={`otp-box ${isSuccess ? 'page-transition' : ''}`}>
        <h2>OTP Verification</h2>
        {message && <div className={`otp-message ${isSuccess ? 'success' : 'error'}`}>{message}</div>}
        <div className="email-display">
          <p>OTP has been sent to: <strong>{email}</strong></p>
        </div>

        <div className="otp-input-group">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="otp-input"
            />
          ))}
        </div>

        <div className="otp-timer">
          {timer > 0
            ? `Time left: ${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`
            : 'OTP expired'}
        </div>

        <button
          className="otp-btn verify"
          onClick={handleSubmit}
          disabled={otp.includes('') || isSuccess}
        >
          Verify OTP
        </button>

        {timer === 0 && !isSuccess && (
          <button 
            type="button" 
            onClick={handleResendOTP} 
            className={`resend-button ${isResending ? 'loading' : ''}`}
            disabled={isResending}
          >
            {isResending ? (
              <span className="loading-spinner"></span>
            ) : 'Resend OTP'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
