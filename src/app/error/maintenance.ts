import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ErrorPageComponent } from './error-page';

@Component({
  selector: 'app-maintenance',
  imports: [ErrorPageComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-page
      tone="warning"
      heading="Down for scheduled maintenance"
      description="We're shipping an upgrade and will be back shortly. Nothing is lost — your data is safe while we work."
      icon="solar:settings-bold-duotone">
      <ng-container actions>
        <button matButton="filled" class="!h-11" type="button" (click)="reload()">Check again</button>
        <a matButton="outlined" class="!h-11" href="https://status.example.com" target="_blank" rel="noopener">
          Status updates
        </a>
      </ng-container>
    </app-error-page>
  `
})
export class MaintenanceComponent {
  protected reload(): void {
    location.reload();
  }
}
