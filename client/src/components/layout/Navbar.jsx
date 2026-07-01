import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiSearch, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import CartDrawer from '../ui/CartDrawer';
import { API_URL } from '../../config';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();
  const getCartCount = useCartStore(state => state.getCartCount);
  const user = useAuthStore(state => state.user);
  const cartCount = getCartCount();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150 && !isMobileMenuOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings && data.settings.general && data.settings.general.announcement) {
          setAnnouncement(data.settings.general.announcement);
        }
      })
      .catch(err => console.error("Failed to fetch settings for announcement:", err));
  }, []);

  return (
    <>
      {announcement && (
        <div className="bg-accent text-primary py-2 px-4 text-xs font-bold uppercase tracking-widest fixed top-0 left-0 w-full z-[60] marquee-container overflow-hidden">
          {announcement.includes('\n') ? (
            <div className="animate-marquee whitespace-nowrap flex gap-16 min-w-max px-4">
              {announcement.split('\n').filter(text => text.trim() !== '').map((text, index) => (
                <span key={index}>{text}</span>
              ))}
            </div>
          ) : (
            <div className="text-center">{announcement}</div>
          )}
        </div>
      )}
      <motion.header
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed left-0 w-full z-50 bg-primary/80 backdrop-blur-md border-b border-white/10 ${announcement ? 'top-[32px]' : 'top-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-secondary hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="text-2xl font-heading font-bold tracking-widest text-secondary uppercase z-50 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
              VYBE
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/shop" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider relative group">
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/wholesale" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider relative group">
                Wholesale
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/custom" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider relative group">
                Custom Print
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <button className="text-secondary hover:text-accent transition-colors duration-300 hidden sm:block">
                <FiSearch className="w-5 h-5" />
              </button>
              <Link to={user ? "/profile" : "/login"} className="text-secondary hover:text-accent transition-colors duration-300 hidden sm:block">
                <FiUser className="w-5 h-5" />
              </Link>
              <button className="text-secondary hover:text-accent transition-colors duration-300 hidden sm:block">
                <FiHeart className="w-5 h-5" />
              </button>
              <button
                className="text-secondary hover:text-accent transition-colors duration-300 relative group"
                onClick={() => setIsCartOpen(true)}
              >
                <FiShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Cinematic Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 0% 0%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 0% 0%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 0% 0%)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-primary flex flex-col justify-center items-center"
          >
            <button
              className="absolute top-6 right-6 text-secondary hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiX className="w-8 h-8" />
            </button>

            <nav className="flex flex-col items-center space-y-8 text-3xl font-heading font-bold uppercase tracking-widest">
              {['Shop', 'Wholesale', 'Custom Print', 'About'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                >
                  <Link
                    to={item === 'Shop' ? '/shop' : item === 'Custom Print' ? '/custom' : `/${item.toLowerCase()}`}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 hover:from-accent hover:to-accent-2 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="pt-8 flex gap-8 border-t border-white/10 w-full justify-center"
              >
                <Link to={user ? "/profile" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="text-secondary hover:text-accent"><FiUser className="w-6 h-6" /></Link>
                <button className="text-secondary hover:text-accent"><FiHeart className="w-6 h-6" /></button>
                <button className="text-secondary hover:text-accent"><FiSearch className="w-6 h-6" /></button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

