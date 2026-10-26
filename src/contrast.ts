export function textOn(background: string): string {
  const hex = background.replace('#', '').slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? '#2B1B45' : '#FFFFFF';
}

function channels(color: string): number[] {
  const hex = color.replace('#', '').slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

// WCAG 2.x relative luminance and contrast ratio (1 to 21).
export function relativeLuminance(color: string): number {
  const [r, g, b] = channels(color).map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

// Darkens (on light backgrounds) or lightens (on dark ones) a color until it is readable as text.
export function readableOn(color: string, background: string, minRatio = 4.5): string {
  if (contrastRatio(color, background) >= minRatio) return color;
  const target = relativeLuminance(background) > 0.18 ? 0 : 255;
  const base = channels(color);
  for (let step = 1; step <= 20; step += 1) {
    const mixed = base.map((value) => Math.round(value + (target - value) * (step / 20)));
    const candidate = `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return target === 0 ? '#000000' : '#FFFFFF';
}
