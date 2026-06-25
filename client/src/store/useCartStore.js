import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '../config';
import { useAuthStore } from './useAuthStore';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product) => {
        set((state) => {
          // Check if identical item (same ID, size, color, prints) already exists
          const existingItemIndex = state.items.findIndex(
            item => 
              item._id === product._id && 
              item.selectedSize === product.selectedSize && 
              item.selectedColor === product.selectedColor &&
              JSON.stringify(item.selectedPrints) === JSON.stringify(product.selectedPrints)
          );

          if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += (product.quantity || 1);
            return { items: newItems };
          } else {
            // Add new item
            return { items: [...state.items, { ...product, cartId: Date.now().toString() }] };
          }
        });
        
        const token = useAuthStore.getState().token;
        if (token) get().syncToBackend(token);
      },

      removeFromCart: (cartId) => {
        set((state) => ({
          items: state.items.filter(item => item.cartId !== cartId)
        }));
        
        const token = useAuthStore.getState().token;
        if (token) get().syncToBackend(token);
      },

      clearCart: () => {
        set({ items: [] });
        
        const token = useAuthStore.getState().token;
        if (token) get().syncToBackend(token);
      },

      setItems: (items) => {
        set({ items });
      },

      fetchFromBackend: async (token) => {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const backendItems = data.items || [];
            const localItems = get().items || [];
            
            let mergedItems = [...backendItems];
            let hasLocalChanges = false;
            
            localItems.forEach(localItem => {
              const exists = mergedItems.find(bItem => 
                bItem.id === localItem.id &&
                bItem._id === localItem._id &&
                bItem.selectedSize === localItem.selectedSize &&
                bItem.selectedColor === localItem.selectedColor &&
                JSON.stringify(bItem.selectedPrints) === JSON.stringify(localItem.selectedPrints)
              );
              
              if (exists) {
                // If it exists in backend, don't just blindly add quantity as they might have just refreshed,
                // but if they just logged in, we want to merge. Let's assume merging is additive.
                // Wait, if they just refreshed, localItems is what was persisted. 
                // But we don't want to double quantity on every refresh!
                // Since this is a login flow, the requirement is "do not remove guest item". 
                // If it's a refresh, localItems and backendItems might be exactly identical.
              } else {
                mergedItems.push(localItem);
                hasLocalChanges = true;
              }
            });
            
            set({ items: mergedItems });
            
            if (hasLocalChanges) {
              get().syncToBackend(token);
            }
          }
        } catch (err) {
          console.error("Failed to fetch cart from backend", err);
        }
      },

      syncToBackend: async (token) => {
        const { items } = get();
        try {
          await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ items })
          });
        } catch (err) {
          console.error("Failed to sync cart to backend", err);
        }
      },

      getCartTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          return total + ((item.price || item.pricePerPiece || 0) * (item.quantity || 1));
        }, 0);
      },

      getCartCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + (item.quantity || 1), 0);
      }
    }),
    {
      name: 'vybe-cart-storage',
    }
  )
);
