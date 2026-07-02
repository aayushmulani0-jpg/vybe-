import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '../config';
import { useAuthStore } from './useAuthStore';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (productId) => {
        const { favoriteIds } = get();
        const isFav = favoriteIds.includes(productId);
        
        if (isFav) {
          set({ favoriteIds: favoriteIds.filter(id => id !== productId) });
        } else {
          set({ favoriteIds: [...favoriteIds, productId] });
        }

        // Sync to backend if logged in
        const token = useAuthStore.getState().token;
        if (token) {
          const method = isFav ? 'DELETE' : 'POST';
          fetch(`${API_URL}/favorites/${productId}`, {
            method,
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error('Failed to sync favorite:', err));
        }
      },

      isFavorite: (productId) => {
        return get().favoriteIds.includes(productId);
      },

      getFavoritesCount: () => {
        return get().favoriteIds.length;
      },

      fetchFromBackend: async (token) => {
        try {
          const res = await fetch(`${API_URL}/favorites/ids`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const backendIds = (data.favoriteIds || []).map(id => id.toString());
            const localIds = get().favoriteIds || [];
            
            // Merge: combine backend + local (union)
            const mergedSet = new Set([...backendIds, ...localIds]);
            const mergedIds = Array.from(mergedSet);
            
            set({ favoriteIds: mergedIds });

            // If local had extras, sync them to backend
            const localExtras = localIds.filter(id => !backendIds.includes(id));
            if (localExtras.length > 0) {
              fetch(`${API_URL}/favorites/sync`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ favoriteIds: localExtras })
              }).catch(err => console.error('Failed to sync local favorites:', err));
            }
          }
        } catch (err) {
          console.error('Failed to fetch favorites:', err);
        }
      },

      clearFavorites: () => {
        set({ favoriteIds: [] });
      }
    }),
    {
      name: 'vybe-favorites-storage',
    }
  )
);
