import axios from 'axios';
import config from './Config';

// Create a pre-configured axios instance
const apiClient = axios.create({
  baseURL: config.backendUrl,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Function to set the auth token
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;