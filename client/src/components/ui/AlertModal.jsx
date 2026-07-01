import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import Button from './Button';

export default function AlertModal({ alertModal, onClose }) {
  if (!alertModal) return null;

  const { title, message, type = 'info' } = alertModal;

  const icons = {
    info: <FiInfo className="w-8 h-8 text-accent" />,
    success: <FiCheckCircle className="w-8 h-8 text-green-500" />,
    error: <FiAlertCircle className="w-8 h-8 text-red-500" />
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
          className="relative w-full max-w-sm glass-card shadow-2xl p-6 text-center overflow-hidden"
        >
          {/* Decorative subtle orb */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-center mb-4">
            {icons[type]}
          </div>
          
          {title && (
            <h3 className="text-xl font-heading font-bold text-secondary uppercase tracking-wider mb-2">
              {title}
            </h3>
          )}
          
          <p className="text-gray-400 font-body mb-6">
            {message}
          </p>
          
          <Button variant="accent" className="w-full" onClick={onClose}>
            Okay
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
