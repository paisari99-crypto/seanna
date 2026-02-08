import { useEffect } from 'react';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Force dark theme as default unless user explicitly chose light
    const savedTheme = localStorage.getItem('seanna_theme');
    const theme = savedTheme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    // Also set background immediately
    document.body.style.backgroundColor = 'var(--background)';
  }, []);

  return children;
}