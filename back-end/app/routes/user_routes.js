const express = require('express');
const passport = require('passport');
const User = require('../models/User');




const userRoutes = () => {
  const router = express.Router();
  const authenticate = passport.authenticate('jwt', { session: false });

  router.get('/', authenticate, async (req, res) => {
    try {
      console.log('Fetching user:', req.user._id);
      const user = await User.findById(req.user._id)
        .populate('likedRestaurants') // Populate likedRestaurants

      if (!user) {
        console.log('User not found');
        return res.status(404).send('User not found');
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send(`Error fetching user: ${error}`);
    }
  });
    return router;
  };

module.exports = userRoutes;

