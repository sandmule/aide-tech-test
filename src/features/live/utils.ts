export type HrData = { time: string; bpm: number };

/** Turn a raw WS payload into our HrData, or null if it’s invalid. */
export function normalizeRaw(raw: unknown): HrData | null {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'timestamp' in raw &&
    'value' in raw &&
    typeof (raw as { timestamp: number }).timestamp === 'number' &&
    typeof (raw as { value: number }).value === 'number'
  ) {
    return {
      time: new Date((raw as { timestamp: number }).timestamp).toISOString(),
      bpm: (raw as { value: number }).value,
    };
  }
  return null;
}

/** Compute min, max, and average on an array of HrData. */
export function computeStats(data: HrData[]): {
  min: number;
  max: number;
  avg: number;
} {
  if (data.length === 0) return { min: 0, max: 0, avg: 0 };
  const values = data.map((d) => d.bpm);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return { min, max, avg };
}
