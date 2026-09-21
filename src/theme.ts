import { ColorSchemeName, Platform } from 'react-native';
import { textOn } from './contrast';

export { textOn };

export const palettes = {
  light: {
    background: '#F7F3FC',
    card: '#FFFFFF',
    text: '#2B1B45',
    muted: '#6F5F88',
    border: '#E8DFF4',
    primary: '#7B4FB8',
    gold: '#D4A537',
    input: '#F2ECF9',
    accentSoft: '#FBF1D6',
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
  },
};

export type Palette = typeof palettes.dark;

export const accentColors = ['#8B5FC7', '#D4A537', '#B08BE0', '#E2C069', '#6A3FA3', '#EFD9A0', '#C7B3EA', '#9F7AEA'];

export const shadow = Platform.select({
  ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  default: { elevation: 3 },
});

export const radius = { card: 22, control: 14 };

export function getPalette(scheme: ColorSchemeName) {
  return scheme === 'dark' ? palettes.dark : palettes.light;
}

export function cardSurface(palette: Palette) {
  return { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 };
}
