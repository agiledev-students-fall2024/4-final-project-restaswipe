
const express = require('express');
const passport = require('passport');
const Restaurant = require('../models/restaurant');

const restaurantRoutes = () => {
  const router = express.Router();
  const authenticate = passport.authenticate('jwt', { session: false });

  // Get Restaurants with Optional Filters
  router.get('/', authenticate, async (req, res) => {
    try {
      const { page = 1, limit = 10, cuisine, neighborhood } = req.query;
  
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const cuisineArray = cuisine ? cuisine.split(',').map((c) => c.toLowerCase()) : [];
      const neighborhoodArray = neighborhood ? neighborhood.split(',').map((n) => n.toLowerCase()) : [];
  
      // Build query object
      const query = {};
      if (cuisineArray.length > 0) {
        query.cuisine = { $in: cuisineArray };
      }
      if (neighborhoodArray.length > 0) {
        query.neighborhood = { $in: neighborhoodArray };
      }
  
      // Exclude restaurants that the user has liked or disliked
      const seenRestaurants = [
        ...(req.user.likedRestaurants || []),
        ...(req.user.dislikedRestaurants || []),
      ];
  
      if (seenRestaurants.length > 0) {
        query._id = { $nin: seenRestaurants };
      }
  
      // Fetch total count for pagination
      const total = await Restaurant.countDocuments(query);
  
      // Fetch paginated results
      const data = await Restaurant.find(query)
        .skip((pageInt - 1) * limitInt)
        .limit(limitInt);
  
      res.json({
        total,
        page: pageInt,
        limit: limitInt,
        data,
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res.status(500).send('Error fetching restaurants');
    }
  });

  // Search Restaurants by Name
  router.get('/search', authenticate, async (req, res) => {
    try {
      const { query: searchQuery } = req.query;
      if (!searchQuery) {
        return res.status(400).send('Missing query parameter');
      }

      const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
      const searchResults = await Restaurant.find({ name: regex });

      res.json(searchResults);
    } catch (error) {
      console.error('Error searching for restaurant:', error);
      res.status(500).send('Error searching for restaurant');
    }
  });

  router.post('/:id/like', authenticate, async (req, res) => {
    const restaurantId = req.params.id;
    const user = req.user;

    // Validate restaurantId
   

    try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).send('Restaurant not found');
      }

      // Remove from dislikedRestaurants if it exists
      user.dislikedRestaurants = user.dislikedRestaurants.filter(
        (id) => id.toString() !== restaurantId
      );
      // Add to likedRestaurants if not already there
      if (!user.likedRestaurants.includes(restaurantId)) {
        user.likedRestaurants.push(restaurantId);
      }
      await user.save();

      res.send(`User ${user.email} liked restaurant ${restaurantId}`);
    } catch (error) {
      console.error('Error liking restaurant:', error);
      res.status(500).send('Error liking restaurant');
    }
  });

  // Dislike a Restaurant
  router.post('/:id/dislike', authenticate, async (req, res) => {
    const restaurantId = req.params.id;
    const user = req.user;

    try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).send('Restaurant not found');
      }

      // Remove from likedRestaurants if it exists
      user.likedRestaurants = user.likedRestaurants.filter(
        (id) => id.toString() !== restaurantId
      );
      // Add to dislikedRestaurants if not already there
      if (!user.dislikedRestaurants.includes(restaurantId)) {
        user.dislikedRestaurants.push(restaurantId);
      }
      await user.save();

      res.send(`User ${user.email} disliked restaurant ${restaurantId}`);
    } catch (error) {
      console.error('Error disliking restaurant:', error);
      res.status(500).send('Error disliking restaurant');
    }
  });
  return router;
};

module.exports = restaurantRoutes;
