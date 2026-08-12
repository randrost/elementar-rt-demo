import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ColorScheme, ColorSchemeStore } from '@elementar-rt/components/color-scheme';
import { PageComponent } from '../shell/page/page';

/** Token groups worth showing side by side; each swatch reads its own token. */
const SWATCHES: readonly { group: string; tokens: { name: string; bg: string; text: string }[] }[] = [
  {
    group: 'Primary',
    tokens: [
      { name: 'primary', bg: 'bg-primary', text: 'text-on-primary' },
      { name: 'primary-container', bg: 'bg-primary-container', text: 'text-on-primary-container' }
    ]
  },
  {
    group: 'Surface',
    tokens: [
      { name: 'surface', bg: 'bg-surface', text: 'text-on-surface' },
      { name: 'surface-container-low', bg: 'bg-surface-container-low', text: 'text-on-surface' },
      { name: 'surface-container', bg: 'bg-surface-container', text: 'text-on-surface' },
      { name: 'surface-container-highest', bg: 'bg-surface-container-highest', text: 'text-on-surface' }
    ]
  },
  {
    group: 'Semantic',
    tokens: [
      { name: 'green-container', bg: 'bg-green-container', text: 'text-on-green-container' },
      { name: 'orange-container', bg: 'bg-orange-container', text: 'text-on-orange-container' },
      { name: 'red-container', bg: 'bg-red-container', text: 'text-on-red-container' },
      { name: 'blue-container', bg: 'bg-blue-container', text: 'text-on-blue-container' }
    ]
  }
];

@Component({
  selector: 'app-gallery-themes',
  imports: [PageComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Themes" description="The token set behind every surface, and the scheme switch that flips it.">
      <!-- Scheme -->
      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-on-surface">Colour scheme</h2>
            <p class="mt-1 max-w-lg text-sm text-on-surface-variant">
              Dark mode is derived from the same tokens rather than hand-authored, so the two stay in
              step as the palette moves. The choice persists across reloads.
            </p>
          </div>
          <span class="rounded-full bg-primary-container px-3 py-1 text-sm font-medium capitalize text-on-primary-container">
            {{ colorScheme.theme() }}
          </span>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          @for (option of schemes; track option.id) {
            <button
              type="button"
              class="overflow-hidden rounded-2xl border text-left transition-colors"
              [class]="
                colorScheme.theme() === option.id
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-outline-variant hover:bg-surface-container-low'
              "
              [attr.aria-pressed]="colorScheme.theme() === option.id"
              (click)="colorScheme.setScheme(option.id)">
              <span class="flex h-28 items-stretch gap-1.5 p-3" [class]="option.preview">
                <span class="w-1/4 rounded-lg" [class]="option.bar"></span>
                <span class="flex flex-1 flex-col gap-1.5">
                  <span class="h-1/3 rounded-lg" [class]="option.bar"></span>
                  <span class="flex-1 rounded-lg" [class]="option.bar"></span>
                </span>
              </span>
              <span class="flex items-center gap-2 border-t border-outline-variant px-4 py-3">
                <iconify-icon [icon]="option.icon" width="20" height="20" class="text-primary"></iconify-icon>
                <span class="text-sm font-medium text-on-surface">{{ option.label }}</span>
                @if (colorScheme.theme() === option.id) {
                  <iconify-icon icon="solar:check-circle-bold" width="18" height="18" class="ml-auto text-primary"></iconify-icon>
                }
              </span>
            </button>
          }
        </div>
      </section>

      <!-- Tokens -->
      <section class="mt-6 rounded-2xl border border-outline-variant bg-surface p-6">
        <h2 class="text-base font-semibold text-on-surface">Tokens</h2>
        <p class="mt-1 text-sm text-on-surface-variant">
          Every swatch paints itself with the token it names, so this page is its own proof.
        </p>

        <div class="mt-5 flex flex-col gap-6">
          @for (group of swatches; track group.group) {
            <div>
              <h3 class="mb-3 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                {{ group.group }}
              </h3>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                @for (token of group.tokens; track token.name) {
                  <div class="overflow-hidden rounded-xl border border-outline-variant">
                    <div class="flex h-20 items-end p-3" [class]="token.bg">
                      <code class="text-xs" [class]="token.text">Aa</code>
                    </div>
                    <p class="border-t border-outline-variant px-3 py-2 text-xs text-on-surface-variant">
                      {{ token.name }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Components under theme -->
      <section class="mt-6 rounded-2xl border border-outline-variant bg-surface p-6">
        <h2 class="text-base font-semibold text-on-surface">Components</h2>
        <p class="mt-1 text-sm text-on-surface-variant">The same controls, rendered under the current scheme.</p>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <button matButton="filled" type="button">Filled</button>
          <button matButton="outlined" type="button">Outlined</button>
          <button matButton type="button">Text</button>
          <button matButton="filled" type="button" disabled>Disabled</button>
          <span class="rounded-full bg-green-container px-2.5 py-1 text-xs font-medium text-on-green-container">Success</span>
          <span class="rounded-full bg-orange-container px-2.5 py-1 text-xs font-medium text-on-orange-container">Warning</span>
          <span class="rounded-full bg-red-container px-2.5 py-1 text-xs font-medium text-on-red-container">Error</span>
          <span class="rounded-full bg-surface-container-highest px-2.5 py-1 text-xs font-medium text-on-surface-variant">Neutral</span>
        </div>
      </section>
    </app-page>
  `
})
export class GalleryThemesComponent {
  protected readonly colorScheme = inject(ColorSchemeStore);
  protected readonly swatches = SWATCHES;

  protected readonly schemes: readonly {
    id: ColorScheme;
    label: string;
    icon: string;
    preview: string;
    bar: string;
  }[] = [
    { id: 'light', label: 'Light', icon: 'solar:sun-bold-duotone', preview: 'bg-neutral-100', bar: 'bg-white' },
    { id: 'dark', label: 'Dark', icon: 'solar:moon-bold-duotone', preview: 'bg-neutral-900', bar: 'bg-neutral-700' }
  ];
}
