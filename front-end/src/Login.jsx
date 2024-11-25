import React, { useState, useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from './api/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle Email Submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/request`, { email });
      if (response.status === 200) {
        setShowOtpInput(true);
        setMessage('OTP has been sent to your email.');
      }
    } catch (error) {
      setMessage('Error sending OTP.');
      console.error(error);
    }
  };

  // Handle OTP Verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/verify`, { email, otp });
      const { token } = response.data;
      login(token);
      navigate('/feed');
    } catch (error) {
      console.error(error);
      setMessage('Invalid OTP.');
    }
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h2>Login with OTP</h2>

      {!showOtpInput ? (
        <form onSubmit={handleEmailSubmit}>
          <div>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <div>
            <label>OTP: </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit">Verify OTP</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
