import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-heading font-bold text-secondary uppercase tracking-widest mb-4">VYBE</h3>
            <p className="text-gray-400 mb-6 font-body text-sm leading-relaxed">
              Premium Streetwear Without Premium Prices. 220 GSM Oversized Tees, Weekly Drops, and Custom Printing.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="text-gray-400 hover:text-accent transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=weekly" className="text-gray-400 hover:text-accent transition-colors">Weekly Drops</Link></li>
              <li><Link to="/shop?category=anime" className="text-gray-400 hover:text-accent transition-colors">Anime Collection</Link></li>
              <li><Link to="/shop?category=minimal" className="text-gray-400 hover:text-accent transition-colors">Minimal Logo</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/wholesale" className="text-gray-400 hover:text-accent transition-colors">Wholesale Pricing</Link></li>
              <li><Link to="/custom" className="text-gray-400 hover:text-accent transition-colors">Custom Printing</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-accent transition-colors">Bulk Orders</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-accent transition-colors">About Us</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Size Guide</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Vybe Streetwear. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-secondary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
