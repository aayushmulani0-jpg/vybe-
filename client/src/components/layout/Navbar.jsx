import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiSearch, FiHeart, FiUser } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import CartDrawer from '../ui/CartDrawer';
import { API_URL } from '../../config';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const getCartCount = useCartStore(state => state.getCartCount);
  const user = useAuthStore(state => state.user);
  const cartCount = getCartCount();

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
      <header className={`fixed left-0 w-full z-50 bg-primary/80 backdrop-blur-md border-b border-white/10 transition-all ${announcement ? 'top-[32px]' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="text-2xl font-heading font-bold tracking-widest text-secondary uppercase">
              VYBE
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/shop" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider">Shop</Link>
              <Link to="/wholesale" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider">Wholesale</Link>
              <Link to="/custom" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider">Custom Print</Link>
              <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors duration-300 uppercase tracking-wider">About</Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <button className="text-secondary hover:text-accent transition-colors duration-300">
                <FiSearch className="w-5 h-5" />
              </button>
              <Link to={user ? "/profile" : "/login"} className="text-secondary hover:text-accent transition-colors duration-300 hidden sm:block">
                <FiUser className="w-5 h-5" />
              </Link>
              <button className="text-secondary hover:text-accent transition-colors duration-300 hidden sm:block">
                <FiHeart className="w-5 h-5" />
              </button>
              <button
                className="text-secondary hover:text-accent transition-colors duration-300 relative"
                onClick={() => setIsCartOpen(true)}
              >
                <FiShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

