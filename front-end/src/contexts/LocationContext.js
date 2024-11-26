import React, { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [searchRadius, setSearchRadius] = useState(1);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);


  const reverseGeocode = async (lat, lng) => {
    /* try {
      const response = await fetch(' ') // TODO implement reverse geocoding here with api from geoapify.com
    } */
  }
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("User denied the request for GeoLocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Unable to retrieve user's location.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get the user's location has timed out.");
            break;
          default:
            setLocationError("An unknown error occured.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };


  const updateSearchSettings = (newRadius, newLocation) => {
    setSearchRadius(newRadius);
    if (newLocation) {
      setLocation(newLocation);
    }
  }

  return (
    <LocationContext.Provider value={{
      searchRadius,
      location,
      locationError,
      isLocating,
      updateSearchSettings, 
      setSearchRadius,
      setLocation,
      getCurrentLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);