import { useEffect } from 'react';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Apply dark theme CSS variables directly
    document.documentElement.style.setProperty('--background', '#0F1115');
    document.documentElement.style.setProperty('--surface', '#1A1D24');
    document.documentElement.style.setProperty('--border', '#2A2F3A');
    document.documentElement.style.setProperty('--primary', '#C9A227');
    document.documentElement.style.setProperty('--primary-foreground', '#0F1115');
    document.documentElement.style.setProperty('--text-primary', '#E8EAF0');
    document.documentElement.style.setProperty('--text-secondary', '#9AA3B2');
    
    document.body.style.backgroundColor = '#0F1115';
    document.body.style.color = '#E8EAF0';
    document.body.style.margin = '0';
    document.body.style.minHeight = '100vh';
    document.documentElement.style.minHeight = '100vh';
  }, []);

  return children;
}