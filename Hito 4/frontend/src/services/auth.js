// src/services/auth.js
import { authAPI } from './api';

export const registerUser = async (formData) => {
  const res = await authAPI.post('/auth/register', formData);
  return res.data;
};

export const loginUser = async (formData) => {
  const res = await authAPI.post('/auth/login', formData);
  return res.data;
};
