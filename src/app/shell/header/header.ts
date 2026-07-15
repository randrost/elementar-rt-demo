import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { filter, map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { ColorSchemeStore } from '@elementar-rt/components/color-scheme';
import { AppStore } from '../../core/app.store';
import { AvatarService } from '../../core/avatar.service';

interface Crumb {
  label: string;
  link: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  'help-center': 'Help Center', 'ai-studio': 'AI Studio', 'file-manager': 'File Manager',
  'user-profile': 'Profile', 'my-profile': 'My Profile', 'set-new-password': 'Set New Password',
  'forgot-password': 'Forgot Password', 'password-reset': 'Password Reset', 'server-error': 'Server Error',
  'not-found': 'Not Found', 'content-editor': 'Content Editor', 'getting-started': 'Getting Started'
};

@Component({
  selector: 'app-header',
  imports: [RouterLink, DatePipe, MatButtonModule, MatMenuModule, MatTooltipModule, MatBadgeModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './header.html'
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly avatars = inject(AvatarService);
  protected readonly store = inject(AppStore);
  protected readonly colorScheme = inject(ColorSchemeStore);

  protected readonly userAvatar = this.avatars.person('rostyslav-tulika');

  protected readonly apps = [
    { label: 'Calendar', icon: 'solar:calendar-bold-duotone', link: '/applications/calendar' },
    { label: 'Email', icon: 'solar:letter-bold-duotone', link: '/applications/email/inbox' },
    { label: 'Kanban', icon: 'solar:notebook-bold-duotone', link: '/applications/kanban' },
    { label: 'Invoice', icon: 'solar:bill-list-bold-duotone', link: '/applications/invoice/list' },
    { label: 'Projects', icon: 'solar:folder-bold-duotone', link: '/applications/projects' },
    { label: 'Contacts', icon: 'solar:users-group-rounded-bold-duotone', link: '/applications/contacts' },
    { label: 'Notes', icon: 'solar:notes-bold-duotone', link: '/applications/notes' },
    { label: 'AI Studio', icon: 'solar:magic-stick-3-bold-duotone', link: '/applications/ai-studio' }
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly breadcrumbs = computed<Crumb[]>(() => {
    const segments = this.currentUrl().split('?')[0].split('/').filter(Boolean);
    const crumbs: Crumb[] = [];
    let path = '';
    for (const seg of segments) {
      path += `/${seg}`;
      if (/^\d+$/.test(seg) || /^[0-9a-f-]{8,}$/i.test(seg)) {
        crumbs.push({ label: `#${seg}`, link: path });
      } else {
        crumbs.push({ label: SEGMENT_LABELS[seg] ?? titleCase(seg), link: path });
      }
    }
    return crumbs;
  });

  protected readonly isDark = computed(() => this.colorScheme.theme() === 'dark');

  protected toggleScheme(): void {
    this.colorScheme.setScheme(this.isDark() ? 'light' : 'dark');
  }
}

function titleCase(seg: string): string {
  return seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
