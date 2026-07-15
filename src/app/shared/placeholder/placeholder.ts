import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PageComponent } from '../../shell/page/page';

/**
 * Generic "coming soon" page used for routes whose feature has not been built yet,
 * so the full navigation is wired and reachable from day one.
 */
@Component({
  selector: 'app-placeholder',
  imports: [PageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="title()">
      <div class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low py-20 text-center">
        <iconify-icon icon="solar:hammer-bold-duotone" width="48" height="48" class="text-primary"></iconify-icon>
        <div>
          <p class="text-lg font-medium text-on-surface">{{ title() }}</p>
          <p class="mt-1 text-sm text-on-surface-variant">This section is coming soon.</p>
        </div>
      </div>
    </app-page>
  `
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = toSignal(
    this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Page')),
    { initialValue: 'Page' }
  );
}
