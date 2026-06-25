import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

export default function Catalogue() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    priceRange: [0, 5000]
  });

  const [products, setProducts] = useState([]);
  const [catalogueName, setCatalogueName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/catalogues/live`)
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          setCatalogueName(data.name || 'Wholesale Catalogue');
          const mapped = data.items
            .filter(item => item.productId) // skip items with missing product refs
            .map(item => ({
              _id: item.productId._id,
              name: item.productId.name,
              price: item.wholesalePrice,
              mrp: item.productId.price, // retail price shown as MRP
              image: item.productId.image,
              wholesalePrice: item.wholesalePrice,
              moq: item.moq,
              stockStatus: item.productId.stockStatus || 'In Stock',
              discountBadge: item.productId.discountBadge,
            }));
          setProducts(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch live catalogue:", err);
        setLoading(false);
      });
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase());
      const matchesPrice = product.price >= appliedFilters.priceRange[0] && (appliedFilters.priceRange[1] === 5000 ? true : product.price <= appliedFilters.priceRange[1]);
      return matchesSearch && matchesPrice;
    });
  }, [products, appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters({
      searchQuery,
      priceRange
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 5000]);
    setAppliedFilters({
      searchQuery: '',
      priceRange: [0, 5000]
    });
  };

  const FiltersContent = () => (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-4">Search</h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 text-secondary px-4 py-3 pl-10 rounded-sm focus:outline-none focus:border-accent transition-colors"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex justify-between mb-4">
          <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider">Price Range</h3>
          <span className="text-accent text-sm">₹{priceRange[0]} - {priceRange[1] === 5000 ? '₹5000+' : `₹${priceRange[1]}`}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="5000" 
          step="50"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full accent-accent bg-neutral-900 h-1 rounded-full appearance-none outline-none"
        />
      </div>

      <Button variant="primary" size="sm" onClick={applyFilters} className="w-full mb-3">
        Apply Filters
      </Button>
      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-secondary uppercase tracking-tighter">
              Wholesale <span className="text-accent italic">Catalogue</span>
            </h1>
            <p className="text-gray-400 mt-2 font-body flex items-center gap-2">
              <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-sm border border-accent/20 text-xs font-semibold uppercase tracking-wider">{catalogueName}</span>
              Showing {filteredProducts.length} results
            </p>
          </div>
          
          <button 
            className="md:hidden mt-6 flex items-center gap-2 text-secondary hover:text-accent"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <FiFilter /> Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <FiltersContent />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                Loading catalogue...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} isWholesale={true} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-sm bg-neutral-900/50">
                <p className="text-2xl font-heading text-secondary mb-4 uppercase tracking-wider">No products found</p>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search query.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/80 z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-neutral-900 z-[70] p-6 overflow-y-auto md:hidden border-l border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-secondary uppercase tracking-wider">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-400 hover:text-secondary">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <FiltersContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
