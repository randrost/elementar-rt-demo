import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStore } from '../core/app.store';
import { SidebarComponent } from './sidebar/sidebar';
import { HeaderComponent } from './header/header';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './shell.html'
})
export class ShellComponent {
  protected readonly store = inject(AppStore);
}
