import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useAuthStore } from '../store/useAuthStore';
import { API_URL } from '../config';
import ProductCard from '../components/ui/ProductCard';
import AnimatedSection from '../components/ui/AnimatedSection';

export default function Wishlist() {
  const { favoriteIds, clearFavorites } = useFavoritesStore();
  const token = useAuthStore(state => state.token);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteProducts();
  }, [favoriteIds]);

  const fetchFavoriteProducts = async () => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all products and filter by favoriteIds
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        const allProducts = data.products || data || [];
        const favProducts = allProducts.filter(p => favoriteIds.includes(p._id));
        setProducts(favProducts);
      }
    } catch (err) {
      console.error('Failed to fetch favorite products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 bg-primary relative overflow-hidden">
      {/* Background Decoration */}
      <div className="gradient-orb gradient-orb-accent w-[300px] h-[300px] -top-20 -left-20 animate-float" />
      <div className="gradient-orb gradient-orb-secondary w-[200px] h-[200px] bottom-20 right-10 animate-float-delayed" />

      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedSection>
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-secondary uppercase tracking-wider flex items-center gap-3">
                <FiHeart className="text-accent" />
                Wishlist
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {favoriteIds.length} {favoriteIds.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {favoriteIds.length > 0 && (
              <button
                onClick={clearFavorites}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors border border-white/10 px-4 py-2 rounded-lg hover:border-red-400/30"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </AnimatedSection>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favoriteIds.length === 0 ? (
          <AnimatedSection>
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <FiHeart className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-xl font-heading font-bold text-white uppercase tracking-wider mb-3">
                No favorites yet
              </h2>
              <p className="text-gray-500 max-w-md mb-8">
                Start exploring our collection and tap the heart icon on products you love. They'll appear here for easy access.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center font-heading font-semibold uppercase tracking-widest bg-accent text-primary hover:bg-secondary px-8 py-3 text-sm transition-all duration-300"
                style={{ borderRadius: 'var(--radius-button, 0px)' }}
              >
                Explore Shop
              </Link>
            </div>
          </AnimatedSection>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence>
              {products.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
