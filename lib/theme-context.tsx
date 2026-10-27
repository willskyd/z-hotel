'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

const DEFAULT_ACCENT = '#d4a574';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  const num = Number.parseInt(value, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    const adjusted = normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    return adjusted;
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getReadableTextColor(hex: string) {
  return relativeLuminance(hex) > 0.5 ? '#0a0e27' : '#ffffff';
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT);

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(t);
  }, []);

  const applyAccentColor = useCallback((color: string) => {
    const value = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : DEFAULT_ACCENT;
    const root = document.documentElement;
    const textColor = getReadableTextColor(value);

    root.style.setProperty('--primary', value);
    root.style.setProperty('--primary-foreground', textColor);
    root.style.setProperty('--ring', value);
    root.style.setProperty('--accent', value);
    root.style.setProperty('--accent-foreground', textColor);
    root.style.setProperty('--sidebar-primary', value);
    root.style.setProperty('--sidebar-primary-foreground', textColor);
    root.style.setProperty('--sidebar-accent-foreground', value);
    root.style.setProperty('--chart-1', value);
    localStorage.setItem('theme-accent', value);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const resolvedTheme: Theme = savedTheme === 'light' ? 'light' : 'dark';
    setThemeState(resolvedTheme);
    applyTheme(resolvedTheme);

    const savedAccent = localStorage.getItem('theme-accent') || DEFAULT_ACCENT;
    setAccentColorState(savedAccent);
    applyAccentColor(savedAccent);
  }, [applyAccentColor, applyTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem('theme', t);
  }, [applyTheme]);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
    applyAccentColor(color);
  }, [applyAccentColor]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
      return next;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, accentColor, setAccentColor, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
