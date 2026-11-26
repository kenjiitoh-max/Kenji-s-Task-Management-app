import { Platform, type ColorSchemeName } from 'react-native';
import { readableAccent, textOn } from './contrast';

export { readableAccent, textOn };

export const palettes = {
  light: {
    background: '#F7F3FB',
    card: '#FFFFFF',
    text: '#1F1233',
    muted: '#6B5A86',
    border: '#E3D3B0',
    primary: '#6A3FA3',
    gold: '#B8892B',
    input: '#EFE7F8',
    accentSoft: '#EFE7F8',
    onLight: '#2B1B45',
    onDark: '#FFFFFF',
  },
  dark: {
    background: '#0F0819',
    card: '#1B1030',
    text: '#FFFFFF',
    muted: '#C9B8E8',
    border: '#6E5326',
    primary: '#C9A24C',
    gold: '#E2C069',
    input: '#2B1B45',
    accentSoft: '#2B1B45',
    onLight: '#2B1B45',
    onDark: '#FFFFFF',
  },
};

export type Palette = typeof palettes.dark;
export type ThemeName = 'light' | 'dark' | 'system';
export type ColorScheme = keyof typeof palettes;

export const themeNames: ThemeName[] = ['light', 'dark', 'system'];

export function isThemeName(value: unknown): value is ThemeName {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function resolveScheme(theme: ThemeName, system?: ColorSchemeName | null): ColorScheme {
  return theme === 'system' ? (system === 'light' ? 'light' : 'dark') : theme;
}

export const accentColors = ['#8B5FC7', '#D4A537', '#B08BE0', '#E2C069', '#6A3FA3', '#EFD9A0', '#C7B3EA', '#9F7AEA'];

export const shadow = Platform.select({
  ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  default: { elevation: 3 },
});

export const radius = { card: 22, control: 14 };

export function getPalette(scheme?: ColorSchemeName | null): Palette {
  return scheme === 'light' ? palettes.light : palettes.dark;
}

export function cardSurface(palette: Palette) {
  return { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 };
}
