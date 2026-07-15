import {
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  input
} from '@angular/core';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { ColorSchemeStore } from '@elementar-rt/components/color-scheme';
import { axisTextColor, gridLineColor, tooltipTheme } from './chart-palette';

/**
 * Renders an ECharts chart on the host element from an `[appChartHost]` option.
 * Handles container resize (ResizeObserver), re-themes on color-scheme change,
 * and disposes on destroy. Runs ECharts outside Angular to avoid change-detection churn.
 */
@Directive({ selector: '[appChartHost]' })
export class ChartHostDirective implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly colorScheme = inject(ColorSchemeStore);

  readonly option = input.required<EChartsOption>({ alias: 'appChartHost' });

  private readonly isDark = computed(() => this.colorScheme.theme() === 'dark');
  private chart?: echarts.ECharts;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => this.init());
    effect(() => {
      // Re-render whenever the option or the scheme changes.
      this.option();
      this.isDark();
      if (this.chart) this.render();
    });
  }

  private init(): void {
    this.zone.runOutsideAngular(() => {
      this.chart = echarts.init(this.host.nativeElement, undefined, { renderer: 'canvas' });
      this.render();
      this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
      this.resizeObserver.observe(this.host.nativeElement);
    });
  }

  private render(): void {
    if (!this.chart) return;
    const dark = this.isDark();
    const base: EChartsOption = {
      textStyle: { color: axisTextColor(dark), fontFamily: 'Open Sans, sans-serif' },
      tooltip: { ...tooltipTheme(dark) },
      grid: { top: 24, right: 16, bottom: 24, left: 8, containLabel: true }
    };
    const merged = mergeThemeChrome(base, this.option(), dark);
    this.chart.setOption(merged, { notMerge: true, lazyUpdate: true });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }
}

/** Merge theme-aware axis/grid defaults into a user-provided option without clobbering it. */
function mergeThemeChrome(base: EChartsOption, opt: EChartsOption, dark: boolean): EChartsOption {
  const axisDefault = {
    axisLine: { lineStyle: { color: gridLineColor(dark) } },
    axisTick: { show: false },
    axisLabel: { color: axisTextColor(dark) },
    splitLine: { lineStyle: { color: gridLineColor(dark) } }
  };
  const applyAxis = (axis: unknown) => {
    if (!axis) return axis;
    const arr = Array.isArray(axis) ? axis : [axis];
    return arr.map((a) => ({ ...axisDefault, ...(a as object) }));
  };
  return {
    ...base,
    ...opt,
    tooltip: { ...base.tooltip, ...(opt.tooltip as object) },
    grid: { ...base.grid, ...(opt.grid as object) },
    xAxis: applyAxis(opt.xAxis) as EChartsOption['xAxis'],
    yAxis: applyAxis(opt.yAxis) as EChartsOption['yAxis']
  };
}
