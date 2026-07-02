/**
 * PRODUCTION-READY CONFIGURATION
 * 
 * Logic:
 * 1. If running locally (npm run dev), it automatically uses the localhost backend.
 * 2. If built for production (npm run build), it FORCES the live vybe-admin backend.
 * This ignores VITE_API_URL to prevent typos in your hosting dashboard from breaking the app.
 */

export const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api'
  : 'https://vybe-admin.onrender.com/api';
