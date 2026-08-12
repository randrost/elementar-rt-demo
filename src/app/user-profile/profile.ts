import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../shell/page/page';
import { AvatarService } from '../core/avatar.service';
import { daysAgo } from '../shared/mock/mock';

type Variant = 'overview' | 'talent';

const ACTIVITY = [
  { icon: 'solar:check-circle-bold-duotone', text: 'Merged', target: 'Widget registry as the single source of truth', at: daysAgo(1) },
  { icon: 'solar:chat-round-dots-bold-duotone', text: 'Commented on', target: 'Accessibility audit findings', at: daysAgo(2) },
  { icon: 'solar:document-add-bold-duotone', text: 'Published', target: 'Deriving dark mode instead of authoring it', at: daysAgo(5) },
  { icon: 'solar:users-group-rounded-bold-duotone', text: 'Joined', target: 'Design guild', at: daysAgo(9) },
  { icon: 'solar:rocket-2-bold-duotone', text: 'Shipped', target: 'Dynamic dashboard grid', at: daysAgo(14) }
];

const SKILLS = [
  { name: 'Angular', level: 92 },
  { name: 'TypeScript', level: 95 },
  { name: 'Design systems', level: 84 },
  { name: 'Accessibility', level: 78 },
  { name: 'Data visualisation', level: 71 },
  { name: 'Performance', level: 66 }
];

const EXPERIENCE = [
  { role: 'Product Engineer', org: 'Elementar RT', period: '2024 — present', blurb: 'Leading the open-source admin template: shell, widget platform, and the dashboard system.' },
  { role: 'Senior Frontend Engineer', org: 'Northwind Trading', period: '2021 — 2024', blurb: 'Rebuilt the internal operations console; cut median task time by a third.' },
  { role: 'Frontend Engineer', org: 'Helix Biosciences', period: '2019 — 2021', blurb: 'Data-heavy lab interfaces, and the charting library behind them.' },
  { role: 'Junior Developer', org: 'Compiler Works', period: '2017 — 2019', blurb: 'Tooling and internal dashboards.' }
];

const PORTFOLIO = [
  { title: 'Widget catalog', blurb: 'Twelve composable dashboard widgets behind one registry.', cover: 'from-indigo-500 to-sky-400' },
  { title: 'Dynamic dashboard', blurb: 'Drag, resize, and persist a layout the user owns.', cover: 'from-violet-500 to-pink-400' },
  { title: 'Design tokens', blurb: 'One token set, two schemes, no hand-authored dark mode.', cover: 'from-emerald-500 to-teal-400' },
  { title: 'Invoice system', blurb: 'Line items, tax, and totals that never drift.', cover: 'from-amber-500 to-orange-400' }
];

const STATS = [
  { label: 'Posts', value: '48' },
  { label: 'Projects', value: '12' },
  { label: 'Followers', value: '1,284' },
  { label: 'Following', value: '316' }
];

@Component({
  selector: 'app-user-profile',
  imports: [PageComponent, RouterLink, RouterLinkActive, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page>
      <!-- Header -->
      <section class="overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        <div class="h-40 bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-400"></div>

        <div class="px-6 pb-6">
          <img
            [src]="avatar"
            alt=""
            class="relative -mt-12 block size-24 rounded-full border-4 border-surface bg-surface-container" />

          <div class="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <h1 class="text-2xl font-semibold tracking-tight text-on-surface">Rostyslav Tulika</h1>
              <p class="mt-1 text-sm text-on-surface-variant">
                Product Engineer · London, UK · Building Elementar RT
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button matButton="outlined" type="button">Message</button>
              <button matButton="filled" type="button">Follow</button>
            </div>
          </div>

          <dl class="mt-6 flex flex-wrap gap-8 border-t border-outline-variant pt-5">
            @for (stat of stats; track stat.label) {
              <div>
                <dt class="text-xs text-on-surface-variant">{{ stat.label }}</dt>
                <dd class="text-lg font-semibold tabular-nums text-on-surface">{{ stat.value }}</dd>
              </div>
            }
          </dl>
        </div>
      </section>

      <!-- Tabs -->
      <nav class="mt-6 flex gap-1 border-b border-outline-variant" aria-label="Profile sections">
        @for (tab of tabs; track tab.path) {
          <a
            [routerLink]="['/user-profile', tab.path]"
            routerLinkActive="!border-primary !text-on-surface"
            class="border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface">
            {{ tab.label }}
          </a>
        }
      </nav>

      @if (variant() === 'overview') {
        <div class="mt-6 flex flex-col gap-6 lg:flex-row">
          <div class="min-w-0 flex-1">
            <section class="rounded-2xl border border-outline-variant bg-surface p-6">
              <h2 class="text-base font-semibold text-on-surface">About</h2>
              <p class="mt-3 text-sm leading-relaxed text-on-surface-variant">
                I build admin interfaces that get out of the way. Most of my work sits at the seam
                between design systems and the applications that consume them — tokens, component
                APIs, and the layout decisions that keep a dense screen readable.
              </p>
              <p class="mt-3 text-sm leading-relaxed text-on-surface-variant">
                Currently writing Elementar RT in the open: an MIT-licensed Angular admin template
                built phase by phase, with every screen verified in a real browser before it ships.
              </p>
            </section>

            <section class="mt-6 rounded-2xl border border-outline-variant bg-surface p-6">
              <h2 class="text-base font-semibold text-on-surface">Recent activity</h2>
              <ol class="mt-5 flex flex-col">
                @for (item of activity; track item.target; let last = $last) {
                  <li class="flex gap-3">
                    <div class="flex flex-col items-center">
                      <span class="grid size-9 shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container">
                        <iconify-icon [icon]="item.icon" width="18" height="18"></iconify-icon>
                      </span>
                      @if (!last) {
                        <span class="w-px flex-1 bg-outline-variant"></span>
                      }
                    </div>
                    <div class="pb-6" [class.pb-0]="last">
                      <p class="text-sm text-on-surface-variant">
                        {{ item.text }}
                        <span class="font-medium text-on-surface">{{ item.target }}</span>
                      </p>
                      <p class="mt-0.5 text-xs text-on-surface-variant">{{ item.at | date: 'mediumDate' }}</p>
                    </div>
                  </li>
                }
              </ol>
            </section>
          </div>

          <aside class="w-full shrink-0 lg:w-80" aria-label="Profile details">
            <section class="rounded-2xl border border-outline-variant bg-surface p-6">
              <h2 class="text-base font-semibold text-on-surface">Details</h2>
              <dl class="mt-4 flex flex-col gap-3 text-sm">
                @for (detail of details; track detail.label) {
                  <div class="min-w-0">
                    <dt class="flex items-center gap-2 text-xs text-on-surface-variant">
                      <iconify-icon [icon]="detail.icon" width="18" height="18" class="shrink-0 text-primary"></iconify-icon>
                      {{ detail.label }}
                    </dt>
                    <dd class="mt-0.5 truncate text-on-surface">{{ detail.value }}</dd>
                  </div>
                }
              </dl>
            </section>
          </aside>
        </div>
      } @else {
        <div class="mt-6 flex flex-col gap-6 lg:flex-row">
          <div class="min-w-0 flex-1">
            <section class="rounded-2xl border border-outline-variant bg-surface p-6">
              <h2 class="text-base font-semibold text-on-surface">Experience</h2>
              <ol class="mt-5 flex flex-col">
                @for (job of experience; track job.role; let last = $last) {
                  <li class="flex gap-3">
                    <div class="flex flex-col items-center">
                      <span class="mt-1 size-2.5 shrink-0 rounded-full bg-primary"></span>
                      @if (!last) {
                        <span class="w-px flex-1 bg-outline-variant"></span>
                      }
                    </div>
                    <div class="pb-6" [class.pb-0]="last">
                      <p class="text-sm font-medium text-on-surface">{{ job.role }}</p>
                      <p class="text-xs text-on-surface-variant">{{ job.org }} · {{ job.period }}</p>
                      <p class="mt-1.5 text-sm text-on-surface-variant">{{ job.blurb }}</p>
                    </div>
                  </li>
                }
              </ol>
            </section>

            <section class="mt-6 rounded-2xl border border-outline-variant bg-surface p-6">
              <h2 class="text-base font-semibold text-on-surface">Portfolio</h2>
              <div class="mt-5 grid gap-4 sm:grid-cols-2">
                @for (item of portfolio; track item.title) {
                  <article class="overflow-hidden rounded-xl border border-outline-variant">
                    <div class="h-24 bg-gradient-to-br" [class]="item.cover"></div>
                    <div class="p-4">
                      <p class="text-sm font-medium text-on-surface">{{ item.title }}</p>
                      <p class="mt-1 text-xs text-on-surface-variant">{{ item.blurb }}</p>
                    </div>
                  </article>
                }
              </div>
            </section>
          </div>

          <aside class="w-full shrink-0 lg:w-80" aria-label="Skills">
            <section class="rounded-2xl border border-outline-variant bg-surface p-6">
              <h2 class="text-base font-semibold text-on-surface">Skills</h2>
              <div class="mt-5 flex flex-col gap-4">
                @for (skill of skills; track skill.name) {
                  <div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-on-surface">{{ skill.name }}</span>
                      <span class="tabular-nums text-on-surface-variant">{{ skill.level }}%</span>
                    </div>
                    <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                      <div class="h-full rounded-full bg-primary" [style.width.%]="skill.level"></div>
                    </div>
                  </div>
                }
              </div>
            </section>
          </aside>
        </div>
      }
    </app-page>
  `
})
export class UserProfileComponent {
  private readonly avatars = inject(AvatarService);

  protected readonly avatar = this.avatars.person('rostyslav-tulika');
  protected readonly stats = STATS;
  protected readonly activity = ACTIVITY;
  protected readonly skills = SKILLS;
  protected readonly experience = EXPERIENCE;
  protected readonly portfolio = PORTFOLIO;

  protected readonly tabs = [
    { path: 'overview', label: 'Overview' },
    { path: 'talent', label: 'Talent' }
  ];

  protected readonly details = [
    { label: 'Email', value: 'r.tulika@narz.net', icon: 'solar:letter-bold-duotone' },
    { label: 'Location', value: 'London, UK', icon: 'solar:map-point-bold-duotone' },
    { label: 'Website', value: 'elementar-rt.dev', icon: 'solar:global-bold-duotone' },
    { label: 'Joined', value: 'March 2024', icon: 'solar:calendar-bold-duotone' }
  ];

  protected readonly variant = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['variant'] as Variant) ?? 'overview')),
    { initialValue: 'overview' as Variant }
  );
}
