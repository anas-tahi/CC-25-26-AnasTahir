// src/services/auth.js
import { authAPI } from './api';

export const registerUser = async (formData) => {
  const res = await authAPI.post('/register', formData);
  return res.data;
};

export const loginUser = async (formData) => {
  const res = await authAPI.post('/login', formData);
  return res.data;
};