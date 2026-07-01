import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { useEffect } from 'react';

export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  // Reset scroll on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full flex-grow flex flex-col"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
