// src/services/auth.js
import API from './api';

export const registerUser = async (formData) => {
  const res = await API.post('/auth/register', formData);
  return res.data;
};

export const loginUser = async (formData) => {
  const res = await API.post('/auth/login', formData);
  return res.data;
};
