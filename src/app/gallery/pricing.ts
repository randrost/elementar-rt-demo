import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageComponent } from '../shell/page/page';

interface Tier {
  id: string;
  name: string;
  monthly: number;
  blurb: string;
  features: string[];
  featured?: boolean;
}

const TIERS: readonly Tier[] = [
  { id: 'starter', name: 'Starter', monthly: 0, blurb: 'Everything you need to try it properly.', features: ['1 workspace', '3 members', '5 dashboards', 'Community support'] },
  { id: 'team', name: 'Team', monthly: 29, blurb: 'For a team that has outgrown spreadsheets.', features: ['Unlimited workspaces', '25 members', 'Unlimited dashboards', 'Saved views', 'Priority support'], featured: true },
  { id: 'business', name: 'Business', monthly: 79, blurb: 'For a company with compliance to answer to.', features: ['Everything in Team', 'SSO (SAML, OIDC)', 'Audit log export', 'Uptime SLA', 'Dedicated CSM'] }
];

const MEMBERSHIPS: readonly Tier[] = [
  { id: 'monthly', name: 'Monthly', monthly: 29, blurb: 'Cancel whenever you like.', features: ['All Team features', 'Cancel any time', 'Invoices by email'] },
  { id: 'annual', name: 'Annual', monthly: 24, blurb: 'Two months free, billed yearly.', features: ['All Team features', 'Two months free', 'Priority support', 'Annual invoice'], featured: true },
  { id: 'lifetime', name: 'Lifetime', monthly: 0, blurb: 'One payment, no renewals.', features: ['All Team features', 'No renewals', 'Founder badge', 'Roadmap input'] }
];

const FAQS: readonly { q: string; a: string }[] = [
  { q: 'Can I change plan later?', a: 'Yes. Upgrades apply immediately and we charge the prorated difference; downgrades take effect at the end of the period.' },
  { q: 'What counts as a member?', a: 'Anyone who can sign in. Viewers count; pending invitations do not until accepted.' },
  { q: 'Do you offer non-profit pricing?', a: 'Registered non-profits and educational institutions get 50%. Email billing with proof and we will apply it.' },
  { q: 'What happens if I cancel?', a: 'Your workspace becomes read-only at the end of the period. Data is kept for 30 days, then purged.' }
];

@Component({
  selector: 'app-gallery-pricing',
  imports: [PageComponent, MatButtonModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="meta().title" [description]="meta().description">
      @if (variant() === 'basic') {
        <div class="mb-8 flex justify-center">
          <div class="flex rounded-xl border border-outline-variant p-0.5" role="group" aria-label="Billing period">
            @for (period of periods; track period.id) {
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                [class]="billing() === period.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
                [attr.aria-pressed]="billing() === period.id"
                (click)="billing.set(period.id)">
                {{ period.label }}
                @if (period.id === 'annual') {
                  <span class="ml-1 text-xs opacity-80">−17%</span>
                }
              </button>
            }
          </div>
        </div>
      }

      <div class="grid gap-5 md:grid-cols-3">
        @for (tier of tiers(); track tier.id) {
          <section
            class="relative flex flex-col rounded-2xl border p-6"
            [class]="tier.featured ? 'border-primary ring-1 ring-primary bg-surface' : 'border-outline-variant bg-surface'">
            @if (tier.featured) {
              <span class="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-on-primary">
                Most popular
              </span>
            }

            <h2 class="text-base font-semibold text-on-surface">{{ tier.name }}</h2>
            <p class="mt-1 text-sm text-on-surface-variant">{{ tier.blurb }}</p>

            <p class="mt-5 flex items-baseline gap-1">
              <span class="text-4xl font-semibold tabular-nums text-on-surface">
                {{ price(tier) | currency: 'USD' : 'symbol' : '1.0-0' }}
              </span>
              <span class="text-sm text-on-surface-variant">{{ priceSuffix(tier) }}</span>
            </p>

            <ul class="mt-6 flex flex-1 flex-col gap-2.5">
              @for (feature of tier.features; track feature) {
                <li class="flex items-start gap-2 text-sm text-on-surface-variant">
                  <iconify-icon icon="solar:check-circle-bold" width="16" height="16" class="mt-0.5 shrink-0 text-primary"></iconify-icon>
                  {{ feature }}
                </li>
              }
            </ul>

            @if (variant() === 'membership') {
              <button
                type="button"
                class="mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-colors"
                [class]="
                  selected() === tier.id
                    ? 'border-primary bg-primary-container text-on-primary-container'
                    : 'border-outline-variant hover:bg-surface-container-low'
                "
                [attr.aria-pressed]="selected() === tier.id"
                (click)="selected.set(tier.id)">
                <span
                  class="grid size-5 shrink-0 place-items-center rounded-full border-2"
                  [class]="selected() === tier.id ? 'border-primary' : 'border-outline-variant'">
                  @if (selected() === tier.id) {
                    <span class="size-2.5 rounded-full bg-primary"></span>
                  }
                </span>
                <span class="text-sm font-medium">
                  {{ selected() === tier.id ? 'Selected' : 'Choose ' + tier.name }}
                </span>
              </button>
            } @else {
              @if (tier.featured) {
                <button matButton="filled" type="button" class="!mt-6" (click)="choose(tier)">
                  {{ tier.monthly === 0 ? 'Start free' : 'Choose ' + tier.name }}
                </button>
              } @else {
                <button matButton="outlined" type="button" class="!mt-6" (click)="choose(tier)">
                  {{ tier.monthly === 0 ? 'Start free' : 'Choose ' + tier.name }}
                </button>
              }
            }
          </section>
        }
      </div>

      @if (variant() === 'membership') {
        <div class="mt-6 flex justify-center">
          <button matButton="filled" type="button" class="!h-11 !px-8" (click)="confirmMembership()">
            Continue with {{ selectedName() }}
          </button>
        </div>
      }

      <section class="mx-auto mt-12 max-w-3xl">
        <h2 class="text-center text-lg font-semibold text-on-surface">Common questions</h2>
        <div class="mt-5 divide-y divide-outline-variant overflow-hidden rounded-2xl border border-outline-variant bg-surface">
          @for (faq of faqs; track faq.q) {
            @let open = expanded() === faq.q;
            <div>
              <h3>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-container-low"
                  [attr.aria-expanded]="open"
                  (click)="toggle(faq.q)">
                  <span class="text-sm font-medium text-on-surface">{{ faq.q }}</span>
                  <iconify-icon
                    icon="solar:alt-arrow-down-linear"
                    width="18"
                    height="18"
                    class="shrink-0 text-on-surface-variant transition-transform"
                    [class.rotate-180]="open"></iconify-icon>
                </button>
              </h3>
              @if (open) {
                <p class="px-5 pb-5 text-sm text-on-surface-variant">{{ faq.a }}</p>
              }
            </div>
          }
        </div>
      </section>
    </app-page>
  `
})
export class GalleryPricingComponent {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly faqs = FAQS;
  protected readonly periods = [
    { id: 'monthly' as const, label: 'Monthly' },
    { id: 'annual' as const, label: 'Annual' }
  ];

  protected readonly billing = signal<'monthly' | 'annual'>('monthly');
  protected readonly selected = signal('annual');
  protected readonly expanded = signal<string | null>(FAQS[0].q);

  protected readonly variant = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['variant'] as 'basic' | 'membership') ?? 'basic')),
    { initialValue: 'basic' as const }
  );

  protected readonly tiers = computed(() => (this.variant() === 'basic' ? TIERS : MEMBERSHIPS));

  protected readonly meta = computed(() =>
    this.variant() === 'basic'
      ? { title: 'Pricing', description: 'Three tiers, billed monthly or annually.' }
      : { title: 'Membership plans', description: 'Pick the commitment that suits you.' }
  );

  protected price(tier: Tier): number {
    if (this.variant() === 'membership') return tier.id === 'lifetime' ? 690 : tier.monthly;
    return this.billing() === 'annual' ? Math.round(tier.monthly * 0.83) : tier.monthly;
  }

  protected priceSuffix(tier: Tier): string {
    if (this.variant() === 'membership' && tier.id === 'lifetime') return 'once';
    return '/month';
  }

  protected selectedName(): string {
    return MEMBERSHIPS.find((tier) => tier.id === this.selected())?.name ?? 'Annual';
  }

  protected toggle(key: string): void {
    this.expanded.update((current) => (current === key ? null : key));
  }

  protected choose(tier: Tier): void {
    this.snackBar.open(`${tier.name} selected`, 'Dismiss', { duration: 3000 });
  }

  protected confirmMembership(): void {
    this.snackBar.open(`Continuing with ${this.selectedName()}`, 'Dismiss', { duration: 3000 });
  }
}
