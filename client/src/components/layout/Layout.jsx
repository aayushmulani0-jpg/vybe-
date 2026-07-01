import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import QuickViewModal from '../ui/QuickViewModal';
import ConfirmModal from '../ui/ConfirmModal';
import AlertModal from '../ui/AlertModal';
import { useUIStore } from '../../store/useUIStore';
import CustomCursor from '../ui/CustomCursor';
import PageTransition from './PageTransition';
import ScrollProgress from '../ui/ScrollProgress';

export default function Layout() {
  const { 
    quickViewProduct, setQuickViewProduct,
    confirmModal, closeConfirm,
    alertModal, closeAlert 
  } = useUIStore();

  return (
    <div className="flex flex-col min-h-screen relative bg-primary">
      <div className="noise-overlay"></div>
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main className="flex-grow">
        <PageTransition />
      </main>
      <Footer />
      
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
      
      <ConfirmModal 
        confirmModal={confirmModal}
        onClose={closeConfirm}
      />
      
      <AlertModal 
        alertModal={alertModal}
        onClose={closeAlert}
      />
    </div>
  );
}
