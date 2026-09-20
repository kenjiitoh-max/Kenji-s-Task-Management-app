import { ColorSchemeName, Platform } from 'react-native';

export const palettes = {
  light: {
    background: '#FBF8F4',
    card: '#FFFFFF',
    text: '#3D3A4A',
    muted: '#8E8A9C',
    border: '#EFE9F2',
    primary: '#9FB8F5',
    input: '#F5F1F8',
    accentSoft: '#FDE8E4',
  },
  dark: {
    background: '#1B1A22',
    card: '#26242F',
    text: '#F3EFF7',
    muted: '#A7A2B5',
    border: '#35323F',
    primary: '#B7C9F8',
    input: '#312E3B',
    accentSoft: '#3A2F3A',
  },
};

export const pastelColors = ['#F8B7A8', '#A9C9F5', '#C9B8F0', '#B5E4C2', '#FBE0A0', '#F7B9D6', '#9EDCE6', '#F6C69E'];

export const shadow = Platform.select({
  ios: { shadowColor: '#6D5C7A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14 },
  default: { elevation: 3 },
});

export const radius = { card: 22, control: 14 };

export function getPalette(scheme: ColorSchemeName) {
  return scheme === 'dark' ? palettes.dark : palettes.light;
}
