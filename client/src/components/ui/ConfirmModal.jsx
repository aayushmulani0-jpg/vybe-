import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';

export default function ConfirmModal({ confirmModal, onClose }) {
  if (!confirmModal) return null;

  const { 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel' 
  } = confirmModal;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-6 text-center"
        >
          <div className="flex justify-center mb-4 text-accent">
            <FiAlertTriangle className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-heading font-bold text-secondary uppercase tracking-wider mb-2">
            {title}
          </h3>
          
          <p className="text-gray-400 font-body mb-8">
            {message}
          </p>
          
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button variant="primary" fullWidth onClick={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
