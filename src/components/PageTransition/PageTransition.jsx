import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import { useNavigationDirection } from '../../context/NavigationContext';

const SLIDE_DISTANCE = 60;

export default function PageTransition() {
  const location = useLocation();
  const { getDirection } = useNavigationDirection();
  
  // Compute direction for this route change
  const direction = getDirection(location.pathname);

  const variants = {
    initial: (dir) => ({
      opacity: 0,
      x: dir * SLIDE_DISTANCE,
      scale: 0.97,
      filter: 'blur(4px)',
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir * -SLIDE_DISTANCE,
      scale: 0.97,
      filter: 'blur(4px)',
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        style={{ willChange: 'transform, opacity, filter' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
