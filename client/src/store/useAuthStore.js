import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '../config';
import { useCartStore } from './useCartStore';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Login failed');
          set({ user: data, token: data.token, loading: false });
          useCartStore.getState().fetchFromBackend(data.token);
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Registration failed');
          set({ user: data, token: data.token, loading: false });
          useCartStore.getState().fetchFromBackend(data.token);
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      googleLogin: async (tokenId) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Google login failed');
          set({ user: data, token: data.token, loading: false });
          useCartStore.getState().fetchFromBackend(data.token);
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        useCartStore.getState().clearCart();
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'vybe-auth-storage',
    }
  )
);
