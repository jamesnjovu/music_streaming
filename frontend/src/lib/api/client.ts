import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach authentication token
apiClient.interceptors.request.use(
  async (config) => {
    // Get the session
    const session = await getSession();
    
    // If there's a session, attach the token to the request
    if (session) {
      config.headers.Authorization = `Bearer ${session.user.id}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you would typically refresh the token
      // For this example, we'll just redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;