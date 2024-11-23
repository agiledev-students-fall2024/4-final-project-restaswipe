
import React, { useState, useEffect, useContext } from 'react';
import SwipeableCard from './SwipeableCard';
import RestaurantCard from './RestaurantCard';
import '../styles/SwipeableFeed.css';
import {
  bulkFetchRestaurants,
  likeRestaurant,
  dislikeRestaurant,
} from '../api/Restaurant';
import { SwipableFeedContext } from '../contexts/SwipableFeedContext';
import { AccountInfoContext } from '../contexts/AccountInfoContext';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const SwipableFeed = ({ filters, selectedRestaurant }) => {
  const { accountInfo } = useContext(AccountInfoContext);
  const { logout } = useContext(AuthContext);

  const {
    setFilteredRestaurants,
    filteredRestaurants: restaurants,
    setAllRestaurants,
  } = useContext(SwipableFeedContext);
  const navigate  = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  console.log(restaurants, currentIndex);
  // Fetch data when accountInfo, page, or filters change
  useEffect(() => {
    if (!accountInfo) return;
    fetchRestaurants(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountInfo]);

  useEffect(() => {
    setPage(1);
    fetchRestaurants(1);
    console.log('filters changed', filters);
  }, [filters]);

  const fetchRestaurants = async (pageNumber) => {
    if (pageNumber === 1) {
      setAllRestaurants([]);
      setFilteredRestaurants([]);
      setHasMore(true);
      setCurrentIndex(0);
    }
    if (isFetching || (!hasMore && pageNumber !== 1)) return;
    setIsFetching(true);
    try {
      const response = await bulkFetchRestaurants({
        page: pageNumber,
        limit: 20,
        neighborhood: filters.neighborhoods ? filters.neighborhoods.join(',') : '',
        cuisine: filters.cuisines ? filters.cuisines.join(',') : '',
      });
      const fetchedRestaurants = response.restaurants;
      if (fetchedRestaurants.length === 0) {
        setHasMore(false);
      } else {
        setAllRestaurants((prevRestaurants) => {
          // Filter out restaurants that are already in the array
          const newRestaurants = fetchedRestaurants.filter(
            (newRestaurant) =>
              !prevRestaurants.some(
                (existingRestaurant) => existingRestaurant._id === newRestaurant._id
              )
          );
          return [...prevRestaurants, ...newRestaurants];
        });
        setFilteredRestaurants((prevRestaurants) => {
          // Filter out restaurants that are already in the array
          const newRestaurants = fetchedRestaurants.filter(
            (newRestaurant) =>
              !prevRestaurants.some(
                (existingRestaurant) => existingRestaurant._id === newRestaurant._id
              )
          );
          return [...prevRestaurants, ...newRestaurants];
        });
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      if (error.response && error.response.status === 401) {
        // Token might be invalid or expired
        logout();
        navigate('/login');
      }
    } finally {
      setIsFetching(false);
    }
  };

  // Handle inserting selected restaurant into the feed
  useEffect(() => {
    if (selectedRestaurant) {
      // Insert the selected restaurant at the current position
      setFilteredRestaurants((prevRestaurants) => {
        const newRestaurants = [...prevRestaurants];
        newRestaurants.splice(currentIndex + 1, 0, selectedRestaurant);
        return newRestaurants;
      });
      // Increase currentIndex to point to the new restaurant
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  const handleSwipe = (dir, index) => {
    const restaurant = restaurants[index];
    if (dir === 'left') {
      dislikeRestaurant(restaurant._id);
    } else if (dir === 'right') {
      likeRestaurant(restaurant._id);
    }
    setCurrentIndex((prevIndex) => prevIndex + 1);

    if (index >= restaurants.length - 1 && hasMore && !isFetching) {
      const newPage = page + 1;
      setPage(newPage);
      fetchRestaurants(newPage);
    }
  };

  return (
    <div className="swipable-feed">
      {restaurants.map(
        (restaurant, index) =>
          index <= currentIndex && (
            <SwipeableCard
              key={restaurant._id}
              index={index}
              currentIndex={currentIndex}
              onSwipeLeft={() => handleSwipe('left', index)}
              onSwipeRight={() => handleSwipe('right', index)}
            >
              <RestaurantCard restaurant={restaurant} />
            </SwipeableCard>
          )
      )}
      {isFetching && <div className="loading">Loading more restaurants...</div>}
      {!hasMore && currentIndex < 0 && (
        <div className="no-more-restaurants">No more restaurants</div>
      )}
    </div>
  );
};

export default SwipableFeed;
