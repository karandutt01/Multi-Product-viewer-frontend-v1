import axios from 'axios'


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const axiosConfig = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})


axiosConfig.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth');

    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        if (parsedData.token) {
          config.headers.Authorization = `Bearer ${String(parsedData.token)}`
        }
      } catch (error) {
        localStorage.removeItem('auth');
      }
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosConfig;

