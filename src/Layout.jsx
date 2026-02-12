import ThemeProvider from '@/components/ThemeProvider';
import BottomNav from '@/components/BottomNav';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  // Pages that should not show bottom nav
  const pagesWithoutNav = [
    'Landing', 'Features', 'Pricing', 'Privacy', 'Terms',
    'Onboarding', 'About', 'Disclaimer'
  ];
  
  const showBottomNav = !pagesWithoutNav.includes(currentPageName);
  
  return (
    <ThemeProvider>
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        paddingBottom: showBottomNav ? '56px' : '0'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      {showBottomNav && <BottomNav />}
    </ThemeProvider>
  );
}