import { axiosInstance } from './config';

export class User {
  constructor(id, email, profilePic="", likedRestaurants=[]) {
    this.id = id;
    this.email = email;
    this.profilePic = profilePic
    this.likedRestaurants = likedRestaurants;
  }

  /**
   * Creates a User from a json response
   */
  static from(json) {
    return Object.assign(new User(), json);
  }
}

export async function fetchUser(email) {
  try {
    const response = await axiosInstance.get(`/user?email=${encodeURIComponent(email)}`);
    const user = User.from(response.data);
    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}