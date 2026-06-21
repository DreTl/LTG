import { motion } from 'framer-motion';

const DURATION = 0.4;

export function FadeIn({ children, delay = 0, className = '', ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION, delay, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, delay = 0, className = '', ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION, delay, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className = '', ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: DURATION, delay, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container for lists/grids. */
export function StaggerGroup({ children, className = '', stagger = 0.08 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', ...rest }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: 'easeOut' } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Wrap a routed page for a subtle entrance transition. */
export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
