import axios from 'axios';

// Create a new instance of axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // The base URL for all our API calls
});

// Add a request interceptor to include the token in every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
