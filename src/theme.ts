import { ColorSchemeName, Platform } from 'react-native';
import { contrastRatio, readableOn, textOn } from './contrast';

export { contrastRatio, readableOn, textOn };

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
    danger: '#D95F59',
  },
  light: {
    background: '#F7F3FC',
    card: '#FFFFFF',
    text: '#2B1B45',
    muted: '#5E4E78',
    border: '#D9C9A3',
    primary: '#6A3FA3',
    gold: '#8A6414',
    input: '#F2ECF9',
    accentSoft: '#FBF1D6',
    danger: '#B91C1C',
  },
};

export type Palette = typeof palettes.dark;

export const accentColors = ['#8B5FC7', '#D4A537', '#B08BE0', '#E2C069', '#6A3FA3', '#EFD9A0', '#C7B3EA', '#9F7AEA'];

export const shadow = Platform.select({
  ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  default: { elevation: 3 },
});

export const radius = { card: 22, control: 14 };

// Follows the iOS appearance setting. Dark stays the default when the scheme is unknown.
export function getPalette(scheme?: ColorSchemeName): Palette {
  return scheme === 'light' ? palettes.light : palettes.dark;
}

export function cardSurface(palette: Palette) {
  return { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 };
}
