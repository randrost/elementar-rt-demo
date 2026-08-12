import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ErrorPageComponent } from './error-page';

@Component({
  selector: 'app-not-found-2',
  imports: [ErrorPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-page
      variant="split"
      code="404"
      heading="This page went missing"
      description="Nothing lives at this address. It may have been moved or deleted — try the dashboard, or use search to find what you need."
      icon="solar:magnifer-zoom-out-bold-duotone" />
  `
})
export class NotFound2Component {}
