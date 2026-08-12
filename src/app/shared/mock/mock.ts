import { Observable, delay, of } from 'rxjs';

/** Deterministic-ish helpers for building mock data. Not cryptographically random. */

export function randomId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Seeded pseudo-random in [0,1) for reproducible mock series.
 *
 * The generator is warmed up before it is handed back: this Lehmer LCG returns
 * roughly `seed / 2^31` on its first call, so a small seed yields ~0.0001 every
 * time. Callers that create a generator per item and read only a draw or two
 * would otherwise land on the same side of every threshold — every message
 * unread, every invoice one line long.
 */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < 4; i++) next();
  return next;
}

export function pick<T>(arr: readonly T[], rnd: () => number = Math.random): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

export function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

/** Simulate an async data source. */
export function mockDelay<T>(value: T, ms = 300): Observable<T> {
  return of(value).pipe(delay(ms));
}

/** Build a smooth-ish numeric series for sparklines/charts. */
export function series(count: number, seed: number, min = 20, max = 100): number[] {
  const rnd = seededRandom(seed);
  let v = (min + max) / 2;
  return range(count).map(() => {
    v += (rnd() - 0.5) * (max - min) * 0.35;
    v = Math.max(min, Math.min(max, v));
    return Math.round(v);
  });
}
