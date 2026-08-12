import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ErrorPageComponent } from './error-page';

@Component({
  selector: 'app-server-error',
  imports: [ErrorPageComponent, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-page
      code="500"
      tone="error"
      heading="Something went wrong on our end"
      description="An unexpected error stopped this request. Our team has been notified — trying again usually works."
      icon="solar:server-square-cloud-bold-duotone">
      <ng-container actions>
        <button matButton="filled" class="!h-11" type="button" (click)="reload()">Try again</button>
        <a matButton="outlined" class="!h-11" routerLink="/dashboard/getting-started">Back to dashboard</a>
      </ng-container>
    </app-error-page>
  `
})
export class ServerErrorComponent {
  protected reload(): void {
    location.reload();
  }
}
