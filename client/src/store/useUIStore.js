import { create } from 'zustand';

export const useUIStore = create((set) => ({
  quickViewProduct: null,
  setQuickViewProduct: (product) => set({ quickViewProduct: product }),
}));
