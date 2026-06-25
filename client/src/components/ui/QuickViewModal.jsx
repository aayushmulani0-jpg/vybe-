import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiCheck, FiMinus, FiPlus, FiPrinter } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useCartStore } from '../../store/useCartStore';

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.image);
  const addToCart = useCartStore(state => state.addToCart);

  if (!product) return null;

  const handleAddToCartOnly = () => {
    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }
    addToCart({ ...product, selectedSize, selectedColor, quantity });
    alert('Added to cart!');
    onClose();
  };

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }
    
    addToCart({ ...product, selectedSize, selectedColor, quantity, orderType: 'Retail' });
    alert('Added to cart!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-neutral-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Left: Images */}
            <div className="w-full md:w-1/2 bg-neutral-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 shrink-0">
              <div className="aspect-square w-full max-w-md relative flex items-center justify-center mb-4">
                <img 
                  src={activeImage} 
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
              
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 w-full max-w-md scrollbar-hide justify-center">
                  {allImages.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors flex items-center justify-center bg-neutral-900 ${activeImage === img ? 'border-accent' : 'border-transparent hover:border-white/30'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 flex flex-col flex-1 min-h-0">
              <div className="p-6 md:p-8 flex-1 overflow-y-auto min-h-0">
                <h2 className="text-3xl font-heading font-bold text-secondary uppercase tracking-wider mb-2">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl text-secondary font-body font-medium">₹{product.price}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-gray-500 font-body line-through">₹{product.comparePrice}</span>
                    <span className="bg-accent text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider">
                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-gray-400 font-body text-sm mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color ? 'border-accent scale-110' : 'border-white/20 hover:border-white/50'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <FiCheck className={['#ffffff', '#fff', 'white'].includes(color.toLowerCase()) ? 'text-black' : 'text-white'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border transition-colors font-body text-sm ${
                          selectedSize === size 
                            ? 'border-accent bg-accent text-primary font-medium' 
                            : 'border-white/20 text-gray-300 hover:border-white/50 bg-transparent'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-white/20 rounded-md overflow-hidden bg-neutral-900">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <input 
                      type="number"
                      value={quantity}
                      readOnly
                      className="w-12 text-center bg-transparent text-white font-medium outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button 
                  variant="accent" 
                  className="w-full flex justify-center items-center gap-2"
                  onClick={handleAddToCart}
                >
                  <FiShoppingBag /> Add to Cart
                </Button>
              </div>
            </div>

              {/* Fixed Bottom Action */}
              <div className="p-6 md:px-8 md:py-6 border-t border-white/10 bg-neutral-900 shrink-0 mt-auto">
                {product.allowCustomPrint && (
                  <button 
                    onClick={() => { onClose(); navigate('/custom-print'); }}
                    className="w-full flex justify-center items-center gap-2 py-3 text-sm text-gray-400 hover:text-accent transition-colors border border-white/10 rounded-md hover:border-accent/50"
                  >
                    <FiPrinter /> Want Custom Prints on this?
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
