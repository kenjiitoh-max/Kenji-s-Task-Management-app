import { ColorSchemeName } from 'react-native';

export const palettes = {
  light: {
    background: '#F7F8FA',
    card: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
    border: '#E5E7EB',
    primary: '#2563EB',
    input: '#F3F4F6',
  },
  dark: {
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    muted: '#9CA3AF',
    border: '#374151',
    primary: '#60A5FA',
    input: '#374151',
  },
};

export function getPalette(scheme: ColorSchemeName) {
  return scheme === 'dark' ? palettes.dark : palettes.light;
}
