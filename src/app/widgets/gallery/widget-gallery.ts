import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PageComponent } from '../../shell/page/page';
import { WidgetDefinition, WidgetGroup, widgetsInGroup } from '../registry';

interface GalleryMeta {
  title: string;
  description: string;
}

const META: Record<WidgetGroup, GalleryMeta> = {
  general: {
    title: 'General widgets',
    description: 'Everyday building blocks: KPIs, traffic, activity, and rankings.'
  },
  crypto: {
    title: 'Crypto widgets',
    description: 'Market prices and balances for portfolio-style dashboards.'
  },
  finance: {
    title: 'Finance widgets',
    description: 'Cash flow, balances, and revenue composition.'
  },
  analytics: {
    title: 'Analytics widgets',
    description: 'Audience, acquisition channels, and geographic reach.'
  }
};

/**
 * Renders one registry group. Every gallery route reuses this component and
 * picks its group from route data, so adding a widget to the registry is enough
 * to make it show up here.
 */
@Component({
  selector: 'app-widget-gallery',
  imports: [PageComponent, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page [title]="meta().title" [description]="meta().description">
      <div class="grid gap-6 lg:grid-cols-2">
        @for (widget of widgets(); track widget.id) {
          <div [class]="spanClass(widget)">
            <ng-container *ngComponentOutlet="widget.component" />
          </div>
        }
      </div>
    </app-page>
  `
})
export class WidgetGalleryComponent {
  private readonly group = toSignal(
    inject(ActivatedRoute).data.pipe(map((d) => d['group'] as WidgetGroup)),
    { initialValue: 'general' as WidgetGroup }
  );

  protected readonly meta = computed(() => META[this.group()]);
  protected readonly widgets = computed(() => widgetsInGroup(this.group()));

  /** Widgets that ask for a full 12 columns get the whole gallery row. */
  protected spanClass(widget: WidgetDefinition): string {
    return widget.defaultCols >= 12 ? 'lg:col-span-2' : '';
  }
}
