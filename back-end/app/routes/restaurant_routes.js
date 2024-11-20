import restaurants from "../../restaurants.json" assert { type: 'json' };;
import { Router } from "express";

const router = Router()
router.get('/restaurants', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      cuisine,
      neighborhood,
    } = req.query;

    // Convert page and limit to integers
    const page_int = parseInt(page);
    const limit_int = parseInt(limit);
    // Convert cuisine and neighborhood to arrays
    const cuisine_array = cuisine ? cuisine.split(',').map(c => c.toLowerCase()) : [];
    const neighborhood_array = neighborhood ? neighborhood.split(',').map(n => n.toLowerCase()) : [];
    // Filter restaurants based on cuisine, neighborhood, and search query
    let filtered_restaurants = restaurants;

    if (cuisine_array.length > 0) {
      filtered_restaurants = filtered_restaurants.filter(restaurant =>
        restaurant.cuisine && cuisine_array.includes(restaurant.cuisine.toLowerCase())
      );
    }

    if (neighborhood_array.length > 0) {
      filtered_restaurants = filtered_restaurants.filter(restaurant =>
        restaurant?.neighborhood && neighborhood_array.includes(restaurant.neighborhood.toLowerCase())
      );
    }

    const start_index = (page_int - 1) * limit_int;
    const end_index = page_int * limit_int;
    const paginated_restaurants = filtered_restaurants.slice(start_index, end_index);

    res.json({
      total: filtered_restaurants.length,
      page: page_int,
      limit: limit_int,
      data: paginated_restaurants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching restaurants');
  }
});

// Like a restaurant
router.post('/restaurant/:id/like', (req, res) => {
  const restaurant_id = req.params.id;
  console.log(`Restaurant ${restaurant_id} liked`);
  res.send(`Restaurant ${restaurant_id} liked`);
});

router.post('/restaurant/:id/dislike', (req, res) => {
  const restaurant_id = req.params.id;
  console.log(`Restaurant ${restaurant_id} disliked`);
  res.send(`Restaurant ${restaurant_id} disliked`);
});


router.get('/restaurant/search', async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).send('Missing query parameter');
    }

    const search_results = restaurants.filter(restaurant => restaurant.name.toLowerCase().includes(query.toLowerCase()));

    res.json(search_results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error searching for restaurant');
  }
});

export default router;
