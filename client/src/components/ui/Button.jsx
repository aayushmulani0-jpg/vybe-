import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-heading font-semibold uppercase tracking-widest transition-all duration-300";
  
  const variants = {
    primary: "bg-secondary text-primary hover:bg-accent hover:text-primary",
    outline: "bg-transparent border border-white/20 text-secondary hover:border-accent hover:text-accent",
    accent: "bg-accent text-primary hover:bg-secondary",
    ghost: "bg-transparent text-secondary hover:text-accent",
  };

  const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-8 py-3",
    lg: "text-base px-10 py-4",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
