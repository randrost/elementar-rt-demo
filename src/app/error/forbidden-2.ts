import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ErrorPageComponent } from './error-page';

@Component({
  selector: 'app-forbidden-2',
  imports: [ErrorPageComponent, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-page
      variant="split"
      code="403"
      tone="warning"
      heading="Access restricted"
      description="This area is limited to members with elevated permissions. Sign in with a different account, or ask an admin to add you to the right role."
      icon="solar:lock-keyhole-minimalistic-bold-duotone">
      <ng-container actions>
        <a matButton="filled" class="!h-11" routerLink="/applications/help-center/support">Request access</a>
        <a matButton="outlined" class="!h-11" routerLink="/auth/sign-in">Switch account</a>
      </ng-container>
    </app-error-page>
  `
})
export class Forbidden2Component {}
