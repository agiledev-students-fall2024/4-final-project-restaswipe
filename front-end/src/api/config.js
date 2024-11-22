import axios from 'axios';

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
});

// Add a request interceptor to include JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (token) {
      config.headers['Authorization'] = `JWT ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
