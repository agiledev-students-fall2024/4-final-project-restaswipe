/*eslint-disable no-unused-vars*/
import React, { useState, useEffect, useContext } from 'react';
import '../styles/Settings.css';
import { AccountInfoContext } from '../contexts/AccountInfoContext';
import { AuthContext } from '../contexts/AuthContext';
import { User } from '../api/User';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { logout } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const { accountInfo, setAccountInfo } = useContext(AccountInfoContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (err) {
      setError("Logout failed. Please try again.");
      console.error(err);
    }
  };

  const handleReturnToProfile = async () => {
    try {
      navigate('/profile');
    } catch (error) {
      setError("Reroute failed. Please try again");
      console.error(error);
    }
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <section className="settings-profile">
        <h2 className="settings-subtitle">Profile Information</h2>
        <div className="profile-details">
          <p className="profile-email">Email: {accountInfo?.email}</p>
        </div>
      </section>

    

      <div className="routing">
        <section className="profile-reroute">
          <button className="profile-button" onClick={handleReturnToProfile}>
            Return to Profile
          </button>
        </section>

        <section className="settings-logout">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Settings;

