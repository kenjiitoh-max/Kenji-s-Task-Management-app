import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getPalette, palettes, resolveScheme, type Palette, type ThemeName } from '../theme';

type ThemeContextValue = {
  theme: ThemeName;
  scheme: 'light' | 'dark';
  dark: boolean;
  palette: Palette;
  setTheme: (theme: ThemeName) => void;
};

type ThemeProviderProps = PropsWithChildren<{
  initialTheme: ThemeName;
  onThemeChange?: (theme: ThemeName) => void;
}>;

const defaultValue: ThemeContextValue = {
  theme: 'dark',
  scheme: 'dark',
  dark: true,
  palette: palettes.dark,
  setTheme: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export function ThemeProvider({ initialTheme, onThemeChange, children }: ThemeProviderProps) {
  const [theme, updateTheme] = useState(initialTheme);
  const system = useColorScheme();
  const scheme = resolveScheme(theme, system);
  const setTheme = useCallback((nextTheme: ThemeName) => {
    updateTheme(nextTheme);
    onThemeChange?.(nextTheme);
  }, [onThemeChange]);
  const value = useMemo(() => ({
    theme,
    scheme,
    dark: scheme === 'dark',
    palette: getPalette(scheme),
    setTheme,
  }), [theme, scheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
