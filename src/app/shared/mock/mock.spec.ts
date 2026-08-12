import { daysAgo, hoursAgo, pick, range, seededRandom, series } from './mock';

describe('mock helpers', () => {
  describe('seededRandom', () => {
    it('is reproducible for the same seed', () => {
      const a = seededRandom(42);
      const b = seededRandom(42);
      const first = [a(), a(), a()];
      const second = [b(), b(), b()];
      expect(first).toEqual(second);
    });

    it('produces different streams for different seeds', () => {
      const a = seededRandom(1);
      const b = seededRandom(2);
      expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
    });

    it('stays inside [0, 1)', () => {
      const rnd = seededRandom(7);
      for (let i = 0; i < 500; i++) {
        const value = rnd();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    /**
     * Regression: the underlying Lehmer LCG returns roughly seed/2^31 on its
     * first call, so small seeds all came back around 0.0001. Callers making a
     * generator per item and reading one draw landed on the same side of every
     * threshold — every message unread, every invoice one line long.
     */
    it('does not return a tiny first value for small seeds', () => {
      for (const seed of [1, 7, 20, 33, 46, 59, 72]) {
        expect(seededRandom(seed)()).toBeGreaterThan(0.01);
      }
    });

    it('spreads first draws across the range for consecutive seeds', () => {
      const firsts = range(40).map((i) => seededRandom(i * 13 + 7)());
      const low = firsts.filter((v) => v < 0.5).length;
      expect(low).toBeGreaterThan(5);
      expect(low).toBeLessThan(35);
    });
  });

  describe('series', () => {
    it('returns the requested length', () => {
      expect(series(12, 3, 10, 20).length).toBe(12);
    });

    it('stays within the requested bounds', () => {
      for (const value of series(200, 9, 25, 75)) {
        expect(value).toBeGreaterThanOrEqual(25);
        expect(value).toBeLessThanOrEqual(75);
      }
    });

    it('is reproducible', () => {
      expect(series(20, 5, 0, 100)).toEqual(series(20, 5, 0, 100));
    });
  });

  describe('range', () => {
    it('counts from zero', () => {
      expect(range(4)).toEqual([0, 1, 2, 3]);
    });

    it('handles zero', () => {
      expect(range(0)).toEqual([]);
    });
  });

  describe('pick', () => {
    it('always returns a member of the list', () => {
      const rnd = seededRandom(11);
      const options = ['a', 'b', 'c'] as const;
      for (let i = 0; i < 50; i++) {
        expect(options).toContain(pick(options, rnd));
      }
    });
  });

  describe('date helpers', () => {
    it('daysAgo goes backwards for positive input', () => {
      expect(new Date(daysAgo(3)).getTime()).toBeLessThan(Date.now());
    });

    it('daysAgo goes forwards for negative input', () => {
      expect(new Date(daysAgo(-3)).getTime()).toBeGreaterThan(Date.now());
    });

    it('hoursAgo is finer-grained than daysAgo', () => {
      const hour = new Date(hoursAgo(1)).getTime();
      const day = new Date(daysAgo(1)).getTime();
      expect(hour).toBeGreaterThan(day);
    });

    it('returns parseable ISO strings', () => {
      expect(Number.isNaN(Date.parse(daysAgo(1)))).toBe(false);
      expect(Number.isNaN(Date.parse(hoursAgo(1)))).toBe(false);
    });
  });
});
