import axios from 'axios';

// Get the base URL from environment variables, defaulting to localhost:8000
const serverBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create the Axios instance, reliably adding the /api prefix
const api = axios.create({
  baseURL: `${serverBaseUrl}/api`,
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;