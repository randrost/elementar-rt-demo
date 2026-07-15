import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Marks a projected <ng-template> as the renderer for a 'custom' datatable column.
 * The template receives `$implicit` (the row) and `value` (the accessor result).
 *
 *   <ng-template appCell="name" let-row let-value="value">…</ng-template>
 */
@Directive({ selector: 'ng-template[appCell]' })
export class CellTemplateDirective {
  readonly appCell = input.required<string>();
  readonly template = inject(TemplateRef);
}
