// src/services/api.js
import axios from 'axios';


export const productAPI = axios.create({
  baseURL: 'http://localhost:5000/products',
});

export const authAPI = axios.create({
  baseURL: 'http://localhost:4000',
});




const attachToken = (api) => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

attachToken(productAPI);
attachToken(authAPI);
