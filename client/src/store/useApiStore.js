import { create } from 'zustand';
import { API_URL } from '../config';

export const useApiStore = create((set, get) => ({
  products: [],
  liveCatalogue: null,
  pricingConfigs: [],
  loading: false,
  error: null,

  // Fetch all basic products
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      set({ products: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Fetch the live catalogue (Contains Wholesale & Custom Print Pricing)
  fetchLiveCatalogue: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/catalogues/live`);
      if (res.status === 404) {
        set({ liveCatalogue: null, loading: false });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch live catalogue');
      const data = await res.json();
      set({ liveCatalogue: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Fetch pricing configurations (e.g., Delivery Fee)
  fetchPricingConfigs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/pricing`);
      if (!res.ok) throw new Error('Failed to fetch pricing configs');
      const data = await res.json();
      set({ pricingConfigs: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Submit an order
  submitOrder: async (orderPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit order');
      
      set({ loading: false });
      return data; // Return the created order
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err; // Re-throw so the UI can catch it and show a toast
    }
  }
}));
