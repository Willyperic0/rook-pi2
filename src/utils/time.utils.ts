export function secondsUntil(end: Date): number {
  const diffMs = end.getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

export function formatSecondsToHuman(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
