/*eslint-disable no-unused-vars */
import React, { useState } from 'react';
import '../styles/RestaurantListItem.css';

const RestaurantListItem = ({ restaurant, onDelete }) => {

  if (!restaurant) return <div>No Restaurant Found</div>;

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure that you want to delete this restaurant?"
    );
    if (confirmed) {
      onDelete(restaurant);
    }
  };


  return (
    <div className="restaurant-list-item">
      <h2 className="restaurant-name">{restaurant.name}</h2>
      
      {/* Display cuisine and neighborhood in small boxes */}
      <div className="info-boxes">
        {restaurant.cuisine && (
          <div className="info-box">{restaurant.cuisine}</div>
        )}
        {restaurant.neighborhood && (
          <div className="info-box">{restaurant.neighborhood}</div>
        )}
      </div>

      {/* Display images in small thumbnail boxes */}
      {restaurant.images && restaurant.images.length > 0 && (
        <div className="images-container">
          {restaurant.images.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`${restaurant.name} image ${index + 1}`} 
              className="thumbnail" 
            />
          ))}
        </div>
      )}

      <div className="button-container">
        <button className="delete-button" onClick={handleDelete}>Delete</button>
      </div>
      
    
    </div>
  );
};

export default RestaurantListItem;
