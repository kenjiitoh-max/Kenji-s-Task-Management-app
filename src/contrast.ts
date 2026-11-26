function luminanceOf(color: string): number {
  const hex = color.replace('#', '').slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function textOn(background: string, ink: { onLight: string; onDark: string }): string {
  const luminance = luminanceOf(background);
  return luminance > 0.45 ? ink.onLight : ink.onDark;
}

// Keeps an accent color for text only when it stands out enough from the surface it sits on.
export function readableAccent(color: string, palette: { card: string; text: string }): string {
  return Math.abs(luminanceOf(color) - luminanceOf(palette.card)) >= 0.35 ? color : palette.text;
}
