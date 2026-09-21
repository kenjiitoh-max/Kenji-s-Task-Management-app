export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function targetIndex(heights: number[], from: number, dy: number): number {
  let index = from;
  let remaining = dy;
  if (dy > 0) {
    while (index < heights.length - 1 && remaining > heights[index + 1] / 2) {
      remaining -= heights[index + 1];
      index += 1;
    }
  } else {
    while (index > 0 && -remaining > heights[index - 1] / 2) {
      remaining += heights[index - 1];
      index -= 1;
    }
  }
  return index;
}
