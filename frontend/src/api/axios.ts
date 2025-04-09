import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to clean up URLs
instance.interceptors.request.use(
  (config) => {
    // Ensure URL starts with a slash if it's not empty
    if (config.url && config.url.length > 0 && !config.url.startsWith('/')) {
      config.url = `/${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
