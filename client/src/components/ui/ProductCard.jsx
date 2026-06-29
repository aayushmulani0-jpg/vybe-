import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import Button from './Button';
import { useUIStore } from '../../store/useUIStore';

export default function ProductCard({ product, isWholesale = false, onQuickAdd, collectionName }) {
  const [isHovered, setIsHovered] = useState(false);
  const setQuickViewProduct = useUIStore(state => state.setQuickViewProduct);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (onQuickAdd) {
      onQuickAdd(product);
    } else {
      setQuickViewProduct(product);
    }
  };

  return (
    <motion.div 
      className="group relative flex flex-col w-full max-w-sm"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-900 mb-4 flex items-center justify-center p-2">
        <button 
          onClick={handleQuickAdd}
          className="w-full h-full flex items-center justify-center relative"
        >
          <motion.img 
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className={`w-full h-full object-contain drop-shadow-2xl ${product.stockStatus === 'Out of Stock' ? 'opacity-40 grayscale' : ''}`}
            initial={{ scale: 1 }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
          />
          {product.stockStatus === 'Out of Stock' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="bg-primary/80 text-accent border border-accent/50 text-xs md:text-sm font-bold px-4 py-2 uppercase tracking-widest backdrop-blur-sm shadow-2xl">
                OUT OF STOCK
              </span>
            </div>
          )}
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {collectionName && (
            <span className="bg-accent/20 border border-accent/50 backdrop-blur-md shadow-[0_0_10px_rgba(163,255,18,0.2)] text-accent text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
              {collectionName}
            </span>
          )}
          {(!isWholesale && product.comparePrice && product.comparePrice > product.price) && (
            <span className="bg-accent text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider">
              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
            </span>
          )}
          {isWholesale && (
            <span className="bg-white text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider border border-white/20 shadow-sm">
              MOQ: 15 Units
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-2 bg-primary/20 backdrop-blur-sm rounded-full text-secondary hover:text-accent hover:bg-primary/50 transition-all z-10">
          <FiHeart className="w-4 h-4" />
        </button>

        {/* Quick Add (Visible on Hover) */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-primary/80 to-transparent flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          {isWholesale ? (
            <Button variant="accent" size="sm" className="w-full flex gap-2" onClick={() => window.location.href='/wholesale'}>
              <FiShoppingBag /> Build Bulk Order
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="w-full bg-white text-primary hover:bg-accent flex gap-2" onClick={handleQuickAdd}>
              <FiShoppingBag /> {product.stockStatus === 'Out of Stock' ? 'View Details' : 'Buy Now'}
            </Button>
          )}
        </motion.div>
      </div>

      <div className="flex flex-col">
        <button 
          onClick={handleQuickAdd} 
          className="font-heading font-semibold text-lg text-secondary uppercase tracking-wider hover:text-accent transition-colors text-left"
        >
          {product.name}
        </button>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center gap-2">
            <span className="text-secondary font-body font-medium">
              ₹{isWholesale ? product.wholesalePrice || Math.round(product.price * 0.75) : product.price}
            </span>
            {isWholesale && (
              <span className="text-accent text-xs font-body border border-accent/20 px-1.5 py-0.5 rounded-sm bg-accent/5">Wholesale</span>
            )}
            {!isWholesale && product.comparePrice && product.comparePrice > product.price && (
              <span className="text-gray-500 font-body text-sm line-through">₹{product.comparePrice}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {product.colors && Array.isArray(product.colors) && product.colors.length > 0 ? (
              <div className="flex gap-1 items-center">
                {product.colors.map((color, index) => {
                  const isOOS = product.stockStatus === 'Out of Stock' || product.outOfStockColors?.includes(color);
                  return (
                  <div 
                    key={index} 
                    className={`w-4 h-4 border rounded-sm relative ${isOOS ? 'border-gray-600 opacity-50' : 'border-white/20'}`} 
                    style={{ backgroundColor: color }}
                    title={color + (isOOS ? ' (Out of Stock)' : '')}
                  >
                    {isOOS && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-px bg-accent rotate-45 absolute shadow-sm"></div>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            ) : (
              <span className="text-[10px] text-gray-400 font-body">1 Color</span>
            )}

            {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="flex gap-1 items-center">
                {product.sizes.map((size, index) => {
                  const isOOS = product.stockStatus === 'Out of Stock' || product.outOfStockSizes?.includes(size);
                  return (
                  <span 
                    key={index} 
                    className={`text-[9px] font-bold border px-1 rounded-sm flex items-center justify-center min-w-[16px] h-4 relative overflow-hidden ${
                      isOOS ? 'border-white/10 text-gray-600 bg-transparent' : 'border-white/20 text-gray-400 bg-white/5'
                    }`}
                    title={size + (isOOS ? ' (Out of Stock)' : '')}
                  >
                    {size}
                    {isOOS && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-accent/70 rotate-12 absolute"></div>
                      </div>
                    )}
                  </span>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
