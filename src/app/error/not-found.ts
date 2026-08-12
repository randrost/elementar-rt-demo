import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ErrorPageComponent } from './error-page';

@Component({
  selector: 'app-not-found',
  imports: [ErrorPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-error-page
      code="404"
      heading="We couldn't find that page"
      description="The page may have been moved, renamed, or never existed. Check the address, or head back to somewhere familiar."
      icon="solar:magnifer-zoom-out-bold-duotone" />
  `
})
export class NotFoundComponent {}
