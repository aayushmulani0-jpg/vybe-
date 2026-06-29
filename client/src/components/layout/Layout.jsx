import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import QuickViewModal from '../ui/QuickViewModal';
import { useUIStore } from '../../store/useUIStore';

export default function Layout() {
  const { quickViewProduct, setQuickViewProduct } = useUIStore();

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
}
