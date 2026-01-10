import axios from "axios";

// PRODUCT SERVICE
export const productAPI = axios.create({
  baseURL: "https://product-service-3lsh.onrender.com/products",
  timeout: 10000,
});

// AUTH SERVICE
export const authAPI = axios.create({
  baseURL: "https://auth-service-a73r.onrender.com/auth",
  timeout: 10000,
});

// COMMENT SERVICE
export const commentAPI = axios.create({
  baseURL: "https://comment-service-f1r6.onrender.com/comments",
  timeout: 10000,
});

// Attach token to all requests
const attachToken = (api) => {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

attachToken(productAPI);
attachToken(authAPI);
attachToken(commentAPI);
