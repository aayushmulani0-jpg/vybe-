/**
 * PRODUCTION-READY CONFIGURATION
 * 
 * This file automatically determines the correct API URL so you NEVER have to manually change it.
 * 
 * Logic:
 * 1. If VITE_API_URL is explicitly set (e.g. in Render environment variables or .env file), it uses that.
 * 2. If running locally (npm run dev), it automatically uses the localhost backend.
 * 3. If built for production (npm run build), it automatically uses the live vybe-admin backend.
 */

const getApiUrl = () => {
  // 1. Explicit override (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Automatic environment detection
  if (import.meta.env.DEV) {
    // Local development
    return 'http://localhost:5000/api';
  }
  
  // 3. Production fallback
  return 'https://vybe-admin.onrender.com/api';
};

export const API_URL = getApiUrl();
