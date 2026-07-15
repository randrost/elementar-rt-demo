import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { AppStore } from '../../core/app.store';
import { NAV_SECTIONS, NavGroup, isGroup } from '../../core/nav';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatRippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(AppStore);
  protected readonly sections = NAV_SECTIONS;
  protected readonly isGroup = isGroup;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  /** Groups the user manually toggled open/closed, overriding auto-expand. */
  private readonly manualToggles = signal<Record<string, boolean>>({});

  protected groupActive(group: NavGroup): boolean {
    const url = this.currentUrl();
    return group.children.some((c) => url.startsWith(c.link));
  }

  protected groupExpanded(group: NavGroup): boolean {
    if (this.store.sidebarCompact()) return false;
    const manual = this.manualToggles()[group.label];
    return manual ?? this.groupActive(group);
  }

  protected toggleGroup(group: NavGroup): void {
    this.manualToggles.update((m) => ({ ...m, [group.label]: !this.groupExpanded(group) }));
  }

  protected onNavigate(): void {
    this.store.setMobileSidebarOpen(false);
  }
}
