
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  neighborhood: { type: String },
  link: { type: String },
  description: { type: String },
  cuisine: { type: String },
  images: { type: [String], required: true },
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
