import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PageComponent } from '../../shell/page/page';

const NAV: readonly { path: string; label: string; icon: string }[] = [
  { path: 'my-profile', label: 'My profile', icon: 'solar:user-circle-linear' },
  { path: 'security', label: 'Security', icon: 'solar:shield-keyhole-linear' },
  { path: 'notifications', label: 'Notifications', icon: 'solar:bell-linear' },
  { path: 'notifications-2', label: 'Notifications (compact)', icon: 'solar:bell-bing-linear' },
  { path: 'billing', label: 'Billing', icon: 'solar:bill-list-linear' },
  { path: 'billing-2', label: 'Billing (cards)', icon: 'solar:card-linear' },
  { path: 'sessions', label: 'Sessions', icon: 'solar:devices-linear' },
  { path: 'cookie', label: 'Cookies', icon: 'solar:cookie-linear' },
  { path: 'payment', label: 'Payment methods', icon: 'solar:wallet-linear' }
];

/** Secondary nav wrapper for every `/account/settings/*` page. */
@Component({
  selector: 'app-account-settings-shell',
  imports: [PageComponent, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Account settings" description="Your profile, security, and how we bill and notify you.">
      <div class="flex flex-col gap-6 lg:flex-row">
        <nav class="w-full shrink-0 lg:w-64" aria-label="Account settings">
          <ul class="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            @for (item of nav; track item.path) {
              <li class="shrink-0 lg:shrink">
                <a
                  [routerLink]="item.path"
                  routerLinkActive="!bg-primary-container !text-on-primary-container"
                  class="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
                  <iconify-icon [icon]="item.icon" width="18" height="18"></iconify-icon>
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="min-w-0 flex-1">
          <router-outlet />
        </div>
      </div>
    </app-page>
  `
})
export class AccountSettingsShellComponent {
  protected readonly nav = NAV;
}
