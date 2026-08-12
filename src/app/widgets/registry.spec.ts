import { WIDGET_REGISTRY, widgetById, widgetsInGroup } from './registry';

describe('widget registry', () => {
  it('has entries', () => {
    expect(WIDGET_REGISTRY.length).toBeGreaterThan(0);
  });

  it('gives every widget a unique id', () => {
    const ids = WIDGET_REGISTRY.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('describes every widget', () => {
    for (const widget of WIDGET_REGISTRY) {
      expect(widget.name.length).toBeGreaterThan(0);
      expect(widget.description.length).toBeGreaterThan(0);
      expect(widget.component).toBeTruthy();
    }
  });

  it('keeps default spans inside the 12-column grid', () => {
    for (const widget of WIDGET_REGISTRY) {
      expect(widget.defaultCols).toBeGreaterThan(0);
      expect(widget.defaultCols).toBeLessThanOrEqual(12);
      expect(widget.defaultRows).toBeGreaterThan(0);
    }
  });

  it('finds a widget by id', () => {
    expect(widgetById('traffic-overview')?.name).toBe('Traffic overview');
  });

  it('returns undefined for an unknown id', () => {
    expect(widgetById('does-not-exist')).toBeUndefined();
  });

  it('filters by group', () => {
    for (const widget of widgetsInGroup('crypto')) {
      expect(widget.groups).toContain('crypto');
    }
  });

  it('puts every grouped widget in a known group', () => {
    const known = new Set(['general', 'crypto', 'finance', 'analytics']);
    for (const widget of WIDGET_REGISTRY) {
      for (const group of widget.groups) expect(known.has(group)).toBe(true);
    }
  });

  it('fills every gallery', () => {
    for (const group of ['general', 'crypto', 'finance', 'analytics'] as const) {
      expect(widgetsInGroup(group).length).toBeGreaterThan(0);
    }
  });
});
