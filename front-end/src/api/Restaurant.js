import { axiosInstance } from './config';

export class Restaurant {
  constructor(id, name, description, location, link, images, pills) {
    this._id = id;
    this.name = name;
    this.description = description;
    this.location = location;
    this.link = link;
    this.images = images;
    this.pills = pills;
  }

  /**
   * Creates a Restaurant from a json response
   */
  static from(json) {
    return Object.assign(new Restaurant(), json);
  }
}

export async function bulkFetchRestaurants({ page = 1, limit = 20, neighborhood, cuisine }) {
  const params = new URLSearchParams({ page, limit });

  if (neighborhood) params.append('neighborhood', neighborhood);
  if (cuisine) params.append('cuisine', cuisine);

  try {
    const response = await axiosInstance.get(`/restaurants?${params.toString()}`);
    const data = response.data;

    const restaurants = data.data.map((restaurantData) => Restaurant.from(restaurantData));

    return {
      restaurants,
      totalPages: Math.ceil(data.total / limit),
      currentPage: data.page,
    };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return { restaurants: [], totalPages: 1, currentPage: 1 };
  }
}

export async function searchRestaurants(query) {
  try {
    const response = await axiosInstance.get(`/restaurants/search?query=${encodeURIComponent(query)}`);
    const data = response.data;

    const restaurants = data.map((restaurantData) => Restaurant.from(restaurantData));
    return restaurants;
  } catch (error) {
    console.error('Error searching for restaurants:', error);
    return [];
  }
}

export async function likeRestaurant(restaurantId) {
  try {
    await axiosInstance.post(`/restaurants/${restaurantId}/like`);
  } catch (error) {
    console.error(`Error liking restaurant ${restaurantId}:`, error);
  }
}

export async function dislikeRestaurant(restaurantId) {
  try {
    await axiosInstance.post(`/restaurants/${restaurantId}/dislike`);
  } catch (error) {
    console.error(`Error disliking restaurant ${restaurantId}:`, error);
  }
}