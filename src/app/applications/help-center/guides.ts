import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { HelpCenterService } from './mock-data';

@Component({
  selector: 'app-help-guides',
  imports: [PageComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Guides" description="Longer walk-throughs for the things worth doing properly.">
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        @for (guide of store.guides(); track guide.id) {
          <article class="flex flex-col rounded-2xl border border-outline-variant bg-surface p-5 transition-colors hover:bg-surface-container-low">
            <span class="w-fit rounded-full bg-primary-container px-2.5 py-1 text-xs font-medium text-on-primary-container">
              {{ guide.category }}
            </span>

            <h2 class="mt-4 text-base font-semibold text-on-surface">{{ guide.title }}</h2>
            <p class="mt-2 flex-1 text-sm text-on-surface-variant">{{ guide.excerpt }}</p>

            <div class="mt-5 flex items-center gap-3 border-t border-outline-variant pt-4">
              <img [src]="avatar(guide.authorSeed)" alt="" class="size-8 rounded-full" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium text-on-surface">{{ authorName(guide.authorSeed) }}</p>
                <p class="truncate text-xs text-on-surface-variant">{{ guide.updated | date: 'MMM d, y' }}</p>
              </div>
              <span class="flex shrink-0 items-center gap-1 text-xs text-on-surface-variant">
                <iconify-icon icon="solar:clock-circle-linear" width="14" height="14"></iconify-icon>
                {{ guide.readMins }} min
              </span>
            </div>
          </article>
        }
      </div>
    </app-page>
  `
})
export class HelpGuidesComponent {
  protected readonly store = inject(HelpCenterService);
  private readonly avatars = inject(AvatarService);

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected authorName(seed: string): string {
    return seed
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
