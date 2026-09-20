type ResetListener = () => void;

const listeners = new Set<ResetListener>();

export function subscribe(listener: ResetListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emit(): void {
  listeners.forEach((listener) => listener());
}
