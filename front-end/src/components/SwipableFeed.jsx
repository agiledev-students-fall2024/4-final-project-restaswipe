import React, { useState, useEffect, useContext } from 'react';
import SwipeableCard from './SwipeableCard';
import RestaurantCard from './RestaurantCard';
import '../styles/SwipeableFeed.css';
import { bulkFetchRestaurants, likeRestaurant, dislikeRestaurant } from '../api/Restaurant';
import { SwipableFeedContext } from '../contexts/SwipableFeedContext';
import { AccountInfoContext } from '../contexts/AccountInfoContext';

const SwipableFeed = () => {
  const { accountInfo } = useContext(AccountInfoContext);
  const { setFilteredRestaurants, filteredRestaurants: restaurants, setAllRestaurants, allRestaurants } = useContext(SwipableFeedContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const fetchedRestaurants = await bulkFetchRestaurants(accountInfo?.id);
      setAllRestaurants(fetchedRestaurants);
      setFilteredRestaurants(fetchedRestaurants);
      setCurrentIndex(fetchedRestaurants.length - 1);
    }
    if(!accountInfo) return;
    fetchData();
  }, [accountInfo]);

  const handleSwipe = (dir, index) => {
    const restaurant = restaurants[index];
    if (dir === 'left') {
      dislikeRestaurant(restaurant.id);
    } else if (dir === 'right') {
      likeRestaurant(restaurant.id);
    }
    setCurrentIndex(index - 1);
  };

  return (
    <div className="swipable-feed">
      {restaurants.map((restaurant, index) => (
        index <= currentIndex && (
          <SwipeableCard
            key={restaurant.id}
            index={index}
            currentIndex={currentIndex}
            onSwipeLeft={() => handleSwipe('left', index)}
            onSwipeRight={() => handleSwipe('right', index)}
          >
            <RestaurantCard restaurant={restaurant} />
          </SwipeableCard>
        )
      ))}
      {currentIndex < 0 && <div className="no-more-restaurants">No more restaurants</div>}
    </div>
  );
};

export default SwipableFeed;
