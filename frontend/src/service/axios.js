import axios from 'axios'

const axiosConfig = axios.create({
  baseURL: "http://localhost:5000/api",
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
          config.headers.Authorization = `Bearer ${parsedData.token}`
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

