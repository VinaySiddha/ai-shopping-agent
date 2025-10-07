// src/api/client.js
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('supabase_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle auth errors
      sessionStorage.removeItem('supabase_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem('supabase_token', token);
  } else {
    sessionStorage.removeItem('supabase_token');
  }
}