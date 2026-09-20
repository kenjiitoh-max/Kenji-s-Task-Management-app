import { textOn } from '../src/contrast';

const accentColors = ['#8B5FC7', '#D4A537', '#B08BE0', '#E2C069', '#6A3FA3', '#EFD9A0', '#C7B3EA', '#9F7AEA'];

describe('textOn', () => {
  it('uses dark text on gold and white text on purple', () => {
    expect(textOn('#D4A537')).toBe('#2B1B45');
    expect(textOn('#C9A24C')).toBe('#2B1B45');
    expect(textOn('#8B5FC7')).toBe('#FFFFFF');
    expect(textOn('#7B4FB8')).toBe('#FFFFFF');
  });

  it('handles every accent color', () => {
    for (const color of accentColors) expect(['#2B1B45', '#FFFFFF']).toContain(textOn(color));
  });
});
