import { textOn } from '../src/contrast';
import { accentColors, getPalette, isThemeName, palettes, resolveScheme, themeNames } from '../src/theme';

describe('textOn', () => {
  it('uses dark text on gold and white text on purple', () => {
    expect(textOn('#D4A537', palettes.dark)).toBe(palettes.dark.onLight);
    expect(textOn('#C9A24C', palettes.dark)).toBe(palettes.dark.onLight);
    expect(textOn('#8B5FC7', palettes.dark)).toBe(palettes.dark.onDark);
    expect(textOn('#7B4FB8', palettes.dark)).toBe(palettes.dark.onDark);
  });

  it('handles every accent color', () => {
    for (const color of accentColors) expect([palettes.dark.onLight, palettes.dark.onDark]).toContain(textOn(color, palettes.dark));
  });
});

describe('theme selection', () => {
  it('returns palettes for each supported color scheme', () => {
    expect(getPalette('light')).toBe(palettes.light);
    expect(getPalette('dark')).toBe(palettes.dark);
  });

  it.each([null, undefined] as const)('defaults %s to the dark palette', (scheme) => {
    expect(getPalette(scheme)).toBe(palettes.dark);
  });

  it('resolves every theme preference against system appearance', () => {
    for (const theme of themeNames) {
      expect(resolveScheme(theme, 'light')).toBe(theme === 'system' ? 'light' : theme);
      expect(resolveScheme(theme, 'dark')).toBe(theme === 'system' ? 'dark' : theme);
      expect(resolveScheme(theme, null)).toBe(theme === 'system' ? 'dark' : theme);
    }
  });

  it('keeps palette keys consistent', () => {
    expect(Object.keys(palettes.light).sort()).toEqual(Object.keys(palettes.dark).sort());
  });

  it('recognizes only supported theme names', () => {
    expect(isThemeName('light')).toBe(true);
    expect(isThemeName('dark')).toBe(true);
    expect(isThemeName('system')).toBe(true);
    expect(isThemeName('unspecified')).toBe(false);
    expect(isThemeName(null)).toBe(false);
  });
});
