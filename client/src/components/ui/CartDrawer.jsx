import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import Button from './Button';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;
    onClose();
    navigate('/checkout');
  };

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

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
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-neutral-950 shadow-2xl z-[101] flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wider">
                  Cart
                </h2>
                {items.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'} · It's in the bag
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 px-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <FiShoppingBag className="w-8 h-8 opacity-30" />
                  </div>
                  <p className="font-heading text-sm uppercase tracking-wider">Your cart is empty</p>
                  <p className="text-xs text-gray-600 text-center">Looks like you haven't added anything yet.</p>
                  <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.cartId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="px-6 py-5 flex gap-4 group relative"
                    >
                      {/* Product Image */}
                      <div className="w-[88px] h-[88px] bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
                        <img
                          src={item.image || (item.uploadedImages && Object.values(item.uploadedImages)[0]) || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white leading-tight pr-2 line-clamp-2">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="p-1 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                              title="Remove"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Meta Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.selectedColor && (
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                {item.selectedSize}
                              </span>
                            )}
                            {item.selectedPrints && item.selectedPrints.length > 0 && (
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                {item.selectedPrints.length} Print{item.selectedPrints.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price + Quantity Row */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-base font-heading font-bold text-accent">
                            ₹{((item.price || item.pricePerPiece || 0) * (item.quantity || 1)).toLocaleString()}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-0 border border-white/10 rounded-full overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-white select-none">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <FiPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-white/10 bg-neutral-950">
                {/* Summary */}
                <div className="px-6 pt-5 pb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Subtotal</span>
                    <span className="text-lg font-heading font-bold text-white">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-600">Shipping & taxes calculated at checkout</p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-5 space-y-3">
                  <Button
                    variant="accent"
                    className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2"
                    onClick={handleCheckout}
                  >
                    Checkout <FiArrowRight className="w-4 h-4" />
                  </Button>
                  <button
                    onClick={clearCart}
                    className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors py-1"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
