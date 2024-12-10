/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useContext } from 'react';
import '../styles/Profile.css';
import { AccountInfoContext } from '../contexts/AccountInfoContext';
import { User } from '../api/User';
import RestaurantListItem from './RestaurantListItem';
import { fetchUser } from "../api/User";
import { useNavigate } from 'react-router-dom';
import { dislikeRestaurant } from '../api/Restaurant';
const ProfilePage = () => {
  const { accountInfo, setAccountInfo } = useContext(AccountInfoContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser().then((user) => {
      if (user) {
        setAccountInfo(user);
      }
    });
  }, [fetchUser]);

  const handleDelete = async (id) => {
      try {
        await dislikeRestaurant(id);
      } catch (error) {
        console.error(`Error disliking restaurant ${id}:`, error);
      }
      const updatedRestaurants = accountInfo.likedRestaurants.filter((restaurant) => restaurant._id !== id);
      setAccountInfo((prev) => new User(prev.id, prev.email, prev.profilePic, updatedRestaurants));
    
  };


  const handleGoToSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>
      
      <div className="profile-card">
        <div className="profile-photo">
          <img
            src={accountInfo.profilePic || "default-profile-pic.jpg"}
            alt={`${accountInfo.email}'s profile`}
            className="profile-pic"
          />
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{accountInfo.email || "User's Name"}</h2>
        </div>
      </div>
      <button className="settings-button" onClick={handleGoToSettings}>
        Go to Settings
      </button>
      <h2>Saved Restaurants</h2>
      
      {Object.keys(accountInfo.likedRestaurants).length > 0 ? (
        Object.entries(accountInfo.likedRestaurants).map(([id, restaurant]) => (
          <RestaurantListItem 
            key={id} 
            restaurant={restaurant} 
            onDelete={() => handleDelete(restaurant._id)}
          />
        ))
      ) : (
        <p className="no-liked-restaurants">
          You haven't liked any restaurants yet.
        </p>
      )}

     
    </div>
  );
};

export default ProfilePage;
