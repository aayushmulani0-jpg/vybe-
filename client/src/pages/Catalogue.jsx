import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

// Dummy products with sizes and print size options
const ALL_PRODUCTS = [
  {
    id: 1, name: "Akira Cyber Tee", price: 549, mrp: 699, colors: 2, isNew: true, stock: 50,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    sizes: ['M', 'L', 'Oversized'], printSizes: ['A3', 'Front + Back']
  },
  {
    id: 2, name: "Minimal Essential Oversized", price: 549, mrp: 699, colors: 4, isNew: true, stock: 8,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1503341455253-b2e723bb3db8?auto=format&fit=crop&q=80&w=800",
    sizes: ['S', 'M', 'L', 'XL', 'Oversized'], printSizes: ['Left Chest Logo', 'A4']
  },
  {
    id: 3, name: "Tokyo Drift Graphic", price: 699, mrp: 899, colors: 1, isNew: true, stock: 15,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800",
    sizes: ['M', 'L', 'XL'], printSizes: ['A3', 'Sleeve Print']
  },
  {
    id: 4, name: "Vintage Washed Black", price: 499, mrp: 699, colors: 3, isNew: false, stock: 100,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800",
    sizes: ['S', 'M', 'L'], printSizes: ['Left Chest Logo', 'A4', 'A3']
  },
  {
    id: 5, name: "Acid Wash Graphic Tee", price: 649, mrp: 899, colors: 1, isNew: false, stock: 30,
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1503341455253-b2e723bb3db8?auto=format&fit=crop&q=80&w=800",
    sizes: ['L', 'XL', 'Oversized'], printSizes: ['A3', 'Front + Back']
  },
  {
    id: 6, name: "Signature Logo Hoodie", price: 1299, mrp: 1999, colors: 2, isNew: false, stock: 45,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1556821840-02c34273574c?auto=format&fit=crop&q=80&w=800",
    sizes: ['S', 'M', 'L', 'XL'], printSizes: ['Left Chest Logo', 'Front + Back']
  }
];

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'Oversized'];
const AVAILABLE_PRINT_SIZES = ['Left Chest Logo', '15 × 7 cm', 'A4', 'A3', 'Sleeve Print', 'Front + Back'];

export default function Catalogue() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrintSizes, setSelectedPrintSizes] = useState([]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter(product => {
      // Search Filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Price Filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Size Filter
      const matchesSize = selectedSizes.length === 0 || 
                          selectedSizes.some(size => product.sizes.includes(size));
                          
      // Print Size Filter
      const matchesPrintSize = selectedPrintSizes.length === 0 || 
                               selectedPrintSizes.some(ps => product.printSizes.includes(ps));

      return matchesSearch && matchesPrice && matchesSize && matchesPrintSize;
    });
  }, [searchQuery, priceRange, selectedSizes, selectedPrintSizes]);

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const togglePrintSize = (size) => {
    setSelectedPrintSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 2000]);
    setSelectedSizes([]);
    setSelectedPrintSizes([]);
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
          <span className="text-accent text-sm">₹{priceRange[0]} - ₹{priceRange[1]}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="2000" 
          step="50"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full accent-accent bg-neutral-900 h-1 rounded-full appearance-none outline-none"
        />
      </div>

      {/* Apparel Sizes */}
      <div>
        <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-4">Apparel Size</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-sm font-body border transition-colors ${
                selectedSizes.includes(size) 
                  ? 'border-accent bg-accent text-primary' 
                  : 'border-white/20 text-gray-400 hover:border-white/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Print Sizes */}
      <div>
        <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-4">Print Size</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_PRINT_SIZES.map(size => (
            <button
              key={size}
              onClick={() => togglePrintSize(size)}
              className={`px-3 py-1.5 text-xs font-body border transition-colors ${
                selectedPrintSizes.includes(size) 
                  ? 'border-accent bg-accent text-primary' 
                  : 'border-white/20 text-gray-400 hover:border-white/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

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
              <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-sm border border-accent/20 text-xs font-semibold uppercase tracking-wider">MOQ: 15 Units</span>
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
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} isWholesale={true} />
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
