const express = require('express');
const passport = require('passport');
const restaurants = require('../../restaurants'); 

const restaurantRoutes = () => {
  const router = express.Router();

  const authenticate = passport.authenticate('jwt', { session: false });

  router.get('/', authenticate, async (req, res) => {
    try {
      const { page = 1, limit = 10, cuisine, neighborhood } = req.query;

      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const cuisineArray = cuisine ? cuisine.split(',').map(c => c.toLowerCase()) : [];
      const neighborhoodArray = neighborhood ? neighborhood.split(',').map(n => n.toLowerCase()) : [];

      let filteredRestaurants = restaurants;

      if (cuisineArray.length > 0) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
          restaurant.cuisine && cuisineArray.includes(restaurant.cuisine.toLowerCase())
        );
      }

      if (neighborhoodArray.length > 0) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
          restaurant.neighborhood && neighborhoodArray.includes(restaurant.neighborhood.toLowerCase())
        );
      }

      const startIndex = (pageInt - 1) * limitInt;
      const paginatedRestaurants = filteredRestaurants.slice(startIndex, startIndex + limitInt);

      res.json({
        total: filteredRestaurants.length,
        page: pageInt,
        limit: limitInt,
        data: paginatedRestaurants,
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res.status(500).send('Error fetching restaurants');
    }
  });

  router.post('/:id/like', authenticate, (req, res) => {
    const restaurantId = req.params.id;
    const user = req.user; // The authenticated user from JWT
    console.log(`User ${user.email} liked restaurant ${restaurantId}`);
    res.send(`User ${user.email} liked restaurant ${restaurantId}`);
  });

  router.post('/:id/dislike', authenticate, (req, res) => {
    const restaurantId = req.params.id;
    const user = req.user; // The authenticated user from JWT
    console.log(`User ${user.email} disliked restaurant ${restaurantId}`);
    res.send(`User ${user.email} disliked restaurant ${restaurantId}`);
  });

  router.get('/search', authenticate, async (req, res) => {
    try {
      const query = req.query.query;

      if (!query) {
        return res.status(400).send('Missing query parameter');
      }

      const searchResults = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query.toLowerCase())
      );

      res.json(searchResults);
    } catch (error) {
      console.error('Error searching for restaurant:', error);
      res.status(500).send('Error searching for restaurant');
    }
  });

  return router;
};

module.exports = restaurantRoutes;
