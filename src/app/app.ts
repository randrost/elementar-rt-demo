import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ColorSchemeStore } from '@elementar-rt/components/color-scheme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
  protected readonly colorScheme = inject(ColorSchemeStore);

  protected toggleScheme(): void {
    this.colorScheme.setScheme(this.colorScheme.theme() === 'dark' ? 'light' : 'dark');
  }
}
