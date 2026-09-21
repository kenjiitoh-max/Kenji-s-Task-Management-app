import { ColorSchemeName, Platform } from 'react-native';
import { textOn } from './contrast';

export { textOn };

export const palettes = {
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
  },
};

export type Palette = typeof palettes.dark;

export const accentColors = ['#8B5FC7', '#D4A537', '#B08BE0', '#E2C069', '#6A3FA3', '#EFD9A0', '#C7B3EA', '#9F7AEA'];

export const shadow = Platform.select({
  ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  default: { elevation: 3 },
});

export const radius = { card: 22, control: 14 };

// The app is dark-only: the OS appearance setting never switches it to a light palette.
export function getPalette(_scheme?: ColorSchemeName): Palette {
  return palettes.dark;
}

export function cardSurface(palette: Palette) {
  return { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 };
}
