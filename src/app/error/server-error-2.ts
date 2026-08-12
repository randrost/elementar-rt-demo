import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ErrorPageComponent } from './error-page';

@Component({
  selector: 'app-server-error-2',
  imports: [ErrorPageComponent, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-page
      variant="split"
      code="500"
      tone="error"
      heading="Our servers hit a snag"
      description="The request failed before it could finish. Nothing you did caused it — give it another go, or check the status page for live updates."
      icon="solar:server-square-cloud-bold-duotone">
      <ng-container actions>
        <button matButton="filled" class="!h-11" type="button" (click)="reload()">Try again</button>
        <a matButton="outlined" class="!h-11" routerLink="/service-pages/integrations">View status</a>
      </ng-container>
    </app-error-page>
  `
})
export class ServerError2Component {
  protected reload(): void {
    location.reload();
  }
}
