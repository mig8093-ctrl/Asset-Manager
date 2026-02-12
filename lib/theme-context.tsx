import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { themeStorage } from '@/lib/storage';
import Colors from '@/constants/colors';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  colors: typeof Colors[Theme];
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await themeStorage.get();
        setTheme(savedTheme);
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await themeStorage.set(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const value = useMemo(() => ({
    theme,
    colors: Colors[theme],
    toggleTheme,
  }), [theme]);

  // Don't render children until theme is loaded to avoid hydration mismatch
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
