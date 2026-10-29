import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className="theme-toggle-group" data-testid="theme-toggle-group" role="group" aria-label="Theme selection">
      <button
        type="button"
        className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Light theme"
        aria-label="Light theme"
        data-testid="theme-light-btn"
      >
        <Sun size={14} />
      </button>

      <button
        type="button"
        className={`theme-toggle-btn ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        title="Follow system theme"
        aria-label="Follow system theme"
        data-testid="theme-system-btn"
      >
        <Laptop size={14} />
      </button>

      <button
        type="button"
        className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark theme"
        aria-label="Dark theme"
        data-testid="theme-dark-btn"
      >
        <Moon size={14} />
      </button>
    </div>
  );
}
