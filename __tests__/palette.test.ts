jest.mock('react-native', () => ({ Platform: { select: (options: Record<string, unknown>) => options.default } }));

import { contrastRatio, readableOn, textOn } from '../src/contrast';
import { accentColors, getPalette, palettes } from '../src/theme';

describe('getPalette', () => {
  it('follows the device color scheme and falls back to dark', () => {
    expect(getPalette('light')).toBe(palettes.light);
    expect(getPalette('dark')).toBe(palettes.dark);
    expect(getPalette('unspecified')).toBe(palettes.dark);
    expect(getPalette(undefined)).toBe(palettes.dark);
  });

  it('gives both palettes the same keys', () => {
    expect(Object.keys(palettes.light).sort()).toEqual(Object.keys(palettes.dark).sort());
  });
});

describe.each(['light', 'dark'] as const)('%s palette contrast (WCAG AA 4.5:1)', (scheme) => {
  const palette = palettes[scheme];
  const surfaces = { background: palette.background, card: palette.card, input: palette.input };

  it.each(['text', 'muted', 'gold', 'primary'] as const)('%s text is readable on every surface', (key) => {
    for (const [name, surface] of Object.entries(surfaces)) {
      expect({ surface: name, ratio: contrastRatio(palette[key], surface) >= 4.5 }).toEqual({ surface: name, ratio: true });
    }
  });

  it('danger text is readable on cards and modals', () => {
    expect(contrastRatio(palette.danger, palette.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(palette.danger, palette.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('button labels are readable on primary and gold buttons', () => {
    expect(contrastRatio(textOn(palette.primary), palette.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(textOn(palette.gold), palette.gold)).toBeGreaterThanOrEqual(4.5);
  });

  it('category accent colors used as text are made readable', () => {
    for (const color of accentColors) expect(contrastRatio(readableOn(color, palette.card), palette.card)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('contrastRatio / readableOn', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('keeps readable colors and adjusts unreadable ones', () => {
    expect(readableOn('#2B1B45', '#FFFFFF')).toBe('#2B1B45');
    expect(readableOn('#E2C069', '#FFFFFF')).not.toBe('#E2C069');
    expect(contrastRatio(readableOn('#6A3FA3', '#1B1030'), '#1B1030')).toBeGreaterThanOrEqual(4.5);
  });
});
