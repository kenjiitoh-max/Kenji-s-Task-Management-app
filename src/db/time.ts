function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function localTimestamp(d = new Date()): string {
  return `${localDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
