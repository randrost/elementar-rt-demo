import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ErrorPageComponent } from './error-page';

@Component({
  selector: 'app-forbidden',
  imports: [ErrorPageComponent, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-page
      code="403"
      tone="warning"
      heading="You don't have access to this"
      description="Your account doesn't include permission for this area. Ask a workspace admin to grant it, or switch to an account that does."
      icon="solar:lock-keyhole-minimalistic-bold-duotone">
      <ng-container actions>
        <a matButton="filled" class="!h-11" routerLink="/dashboard/getting-started">Back to dashboard</a>
        <a matButton="outlined" class="!h-11" routerLink="/applications/help-center/support">Request access</a>
      </ng-container>
    </app-error-page>
  `
})
export class ForbiddenComponent {}
