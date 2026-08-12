import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Micro line chart drawn as inline SVG. Deliberately not ECharts: at tile size a
 * full chart instance costs more than it renders, and this scales with the box.
 */
@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 100 ' + height()"
      preserveAspectRatio="none"
      class="h-full w-full overflow-visible"
      aria-hidden="true">
      @if (fill()) {
        <polygon [attr.points]="areaPoints()" [attr.fill]="color()" opacity="0.14" />
      }
      <polyline
        [attr.points]="linePoints()"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke" />
    </svg>
  `
})
export class SparklineComponent {
  readonly values = input.required<readonly number[]>();
  readonly color = input('currentColor');
  readonly height = input(32);
  readonly fill = input(true);

  /** Normalised [x, y] pairs across a 100-wide, `height`-tall viewBox. */
  private readonly points = computed(() => {
    const values = this.values();
    if (values.length < 2) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const h = this.height();

    return values.map((value, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = h - ((value - min) / span) * h;
      return [Math.round(x * 100) / 100, Math.round(y * 100) / 100] as const;
    });
  });

  protected readonly linePoints = computed(() =>
    this.points()
      .map(([x, y]) => `${x},${y}`)
      .join(' ')
  );

  protected readonly areaPoints = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    return `0,${this.height()} ${this.linePoints()} 100,${this.height()}`;
  });
}
