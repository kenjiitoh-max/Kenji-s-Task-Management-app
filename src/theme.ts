import { ColorSchemeName, Platform } from 'react-native';

export const palettes = {
  light: {
    background: '#F7F3FC',
    card: '#FFFFFF',
    text: '#2B1B45',
    muted: '#8B7BA3',
    border: '#E8DFF4',
    primary: '#7B4FB8',
    gold: '#D4A537',
    input: '#F2ECF9',
    accentSoft: '#FBF1D6',
  },
  dark: {
    background: '#170F24',
    card: '#251A36',
    text: '#F6F0FB',
    muted: '#B4A6CA',
    border: '#3B2C54',
    primary: '#C9A24C',
    gold: '#E2C069',
    input: '#302243',
    accentSoft: '#3D2E56',
  },
};

export const accentColors = ['#8B5FC7', '#D4A537', '#B08BE0', '#E2C069', '#6A3FA3', '#EFD9A0', '#C7B3EA', '#9F7AEA'];

export const shadow = Platform.select({
  ios: { shadowColor: '#4A2D78', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 14 },
  default: { elevation: 3 },
});

export const radius = { card: 22, control: 14 };

export function getPalette(scheme: ColorSchemeName) {
  return scheme === 'dark' ? palettes.dark : palettes.light;
}
