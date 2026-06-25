import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import Button from './Button';

export default function ProductCard({ product, isWholesale = false, onQuickAdd }) {
  const [isHovered, setIsHovered] = useState(false);

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
        <Link to={isWholesale ? '/wholesale' : `/shop/${product._id}`} className="w-full h-full flex items-center justify-center">
          <motion.img 
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-2xl"
            initial={{ scale: 1 }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {(!isWholesale && product.comparePrice && product.comparePrice > product.price) && (
            <span className="bg-accent text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider">
              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
            </span>
          )}
          {product.stockStatus !== 'In Stock' && !isWholesale && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
              {product.stockStatus}
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
            <Button variant="secondary" size="sm" className="w-full bg-white text-primary hover:bg-accent flex gap-2" onClick={() => onQuickAdd && onQuickAdd(product)}>
              <FiShoppingBag /> Buy Now
            </Button>
          )}
        </motion.div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col">
        <Link to={isWholesale ? '/wholesale' : `/shop/${product.id}`} className="font-heading font-semibold text-lg text-secondary uppercase tracking-wider hover:text-accent transition-colors">
          {product.name}
        </Link>
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
                {product.colors.map((color, index) => (
                  <div 
                    key={index} 
                    className="w-4 h-4 border border-white/20 rounded-sm" 
                    style={{ backgroundColor: color }}
                    title={color}
                  ></div>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-gray-400 font-body">1 Color</span>
            )}

            {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="flex gap-1 items-center">
                {product.sizes.map((size, index) => (
                  <span 
                    key={index} 
                    className="text-[9px] font-bold border border-white/20 px-1 rounded-sm text-gray-400 bg-white/5 flex items-center justify-center min-w-[16px] h-4"
                    title={size}
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
