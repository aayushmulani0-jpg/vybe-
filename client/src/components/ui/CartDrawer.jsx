import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import Button from './Button';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeFromCart, addToCart, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) return;
    // ...
  };

  const handleCheckoutAll = () => {
    if (items.length === 0) return;
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900 shadow-2xl z-[101] flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-heading font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                <FiShoppingBag /> Your Cart
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <FiShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="font-body">Your cart is empty.</p>
                  <Button variant="outline" onClick={onClose} className="mt-4">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.cartId} className="flex gap-4 p-4 bg-neutral-950 rounded-lg border border-white/5 relative group">
                    <button 
                      onClick={() => removeFromCart(item.cartId)}
                      className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 rounded-md"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="w-20 h-20 bg-neutral-900 rounded-md overflow-hidden shrink-0 p-2">
                      <img 
                        src={item.image || (item.uploadedImages && Object.values(item.uploadedImages)[0]) || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-heading font-semibold text-white truncate pr-6">{item.name}</h4>
                      
                      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                        {item.selectedSize && <span>Size: <span className="text-white">{item.selectedSize}</span></span>}
                        {item.selectedColor && <span>Color: <span className="text-white capitalize">{item.selectedColor}</span></span>}
                        {item.selectedPrints && item.selectedPrints.length > 0 && <span>Custom Prints: <span className="text-white">{item.selectedPrints.length}</span></span>}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-secondary font-medium">₹{item.price || item.pricePerPiece}</span>
                        <div className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-neutral-950 shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 font-body">Subtotal</span>
                  <span className="text-2xl font-heading font-bold text-accent">₹{getCartTotal().toLocaleString()}</span>
                </div>
                <Button 
                  variant="accent" 
                  className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
                  onClick={handleCheckoutAll}
                >
                  <FiCheck /> Checkout All Items
                </Button>
                <button 
                  onClick={clearCart}
                  className="w-full mt-4 text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
