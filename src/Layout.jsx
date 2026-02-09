import ThemeProvider from '@/components/ThemeProvider';
import BottomNav from '@/components/BottomNav';

export default function Layout({ children, currentPageName }) {
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
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </ThemeProvider>
  );
}