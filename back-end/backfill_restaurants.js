
const mongoose = require('mongoose');
const Restaurant = require('./app/models/restaurant');
const restaurantsData = require('./restaurants.json'); 
require('dotenv').config();

async function backfillRestaurants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    // Optional: Delete existing restaurants (Be cautious with this)
    const deleteResult = await Restaurant.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing restaurants.`);

    // Process data before inserting (e.g., convert fields to lowercase)
    const processedData = restaurantsData.map((restaurant) => ({
      ...restaurant,
      cuisine: restaurant.cuisine ? restaurant.cuisine.toLowerCase() : '',
      neighborhood: restaurant.neighborhood ? restaurant.neighborhood.toLowerCase() : '',
    }));

    // Insert restaurants into the database
    const insertedRestaurants = await Restaurant.insertMany(processedData);
    console.log(`Inserted ${insertedRestaurants.length} restaurants.`);

    // Close the database connection
    await mongoose.connection.close();
    console.log('Closed MongoDB connection.');
  } catch (err) {
    console.error('Error backfilling restaurants:', err);
  }
}

backfillRestaurants();
