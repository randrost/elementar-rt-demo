import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PageComponent } from '../../shell/page/page';
import { COUNTRIES, CURRENCIES, DATE_FORMATS, TIMEZONES } from '../mock-data';

/** Sample instant so each date format renders something concrete. */
const SAMPLE = new Date(2026, 7, 12, 14, 30);

@Component({
  selector: 'app-gallery-selects',
  imports: [PageComponent, FormsModule, MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Selects" description="The four pickers that turn up in every settings screen.">
      <div class="grid gap-5 md:grid-cols-2">
        <!-- Country -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <h2 class="text-base font-semibold text-on-surface">Country</h2>
          <p class="mt-1 text-sm text-on-surface-variant">Flags come from the bundled icon set, not a CDN.</p>

          <mat-form-field appearance="outline" class="mt-4 w-full">
            <mat-label>Country</mat-label>
            <mat-select [(ngModel)]="country">
              @for (item of countries; track item.code) {
                <mat-option [value]="item.code">
                  <span class="flex items-center gap-2">
                    <iconify-icon [icon]="'circle-flags:' + item.code" width="18" height="18"></iconify-icon>
                    {{ item.name }}
                  </span>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <p class="text-xs text-on-surface-variant">Selected: {{ countryName() }}</p>
        </section>

        <!-- Currency -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <h2 class="text-base font-semibold text-on-surface">Currency</h2>
          <p class="mt-1 text-sm text-on-surface-variant">Drives formatting across invoices and dashboards.</p>

          <mat-form-field appearance="outline" class="mt-4 w-full">
            <mat-label>Currency</mat-label>
            <mat-select [(ngModel)]="currency">
              @for (item of currencies; track item.code) {
                <mat-option [value]="item.code">
                  <span class="tabular-nums">{{ item.symbol }}</span> {{ item.code }} — {{ item.name }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <p class="text-xs text-on-surface-variant">Example: {{ sampleAmount() }}</p>
        </section>

        <!-- Timezone -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <h2 class="text-base font-semibold text-on-surface">Timezone</h2>
          <p class="mt-1 text-sm text-on-surface-variant">Everything scheduled is stored in UTC and shown here.</p>

          <mat-form-field appearance="outline" class="mt-4 w-full">
            <mat-label>Timezone</mat-label>
            <mat-select [(ngModel)]="timezone">
              @for (item of timezones; track item) {
                <mat-option [value]="item">{{ item }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <p class="text-xs text-on-surface-variant">Local time there: {{ localTime() }}</p>
        </section>

        <!-- Date format -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <h2 class="text-base font-semibold text-on-surface">Date format</h2>
          <p class="mt-1 text-sm text-on-surface-variant">Applies to every date the product renders.</p>

          <mat-form-field appearance="outline" class="mt-4 w-full">
            <mat-label>Date format</mat-label>
            <mat-select [(ngModel)]="dateFormat">
              @for (item of dateFormats; track item) {
                <mat-option [value]="item">{{ item }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <p class="text-xs text-on-surface-variant">Example: {{ sampleDate() }}</p>
        </section>
      </div>
    </app-page>
  `
})
export class GallerySelectsComponent {
  protected readonly countries = COUNTRIES;
  protected readonly currencies = CURRENCIES;
  protected readonly timezones = TIMEZONES;
  protected readonly dateFormats = DATE_FORMATS;

  protected readonly country = signal('gb');
  protected readonly currency = signal('GBP');
  protected readonly timezone = signal('Europe/London');
  protected readonly dateFormat = signal('D MMMM YYYY');

  protected countryName(): string {
    return COUNTRIES.find((item) => item.code === this.country())?.name ?? '—';
  }

  protected sampleAmount(): string {
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: this.currency() }).format(1234.5);
    } catch {
      return '—';
    }
  }

  protected localTime(): string {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: this.timezone(),
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(SAMPLE);
    } catch {
      return '—';
    }
  }

  protected sampleDate(): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = SAMPLE.getFullYear();
    const m = SAMPLE.getMonth();
    const d = SAMPLE.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    switch (this.dateFormat()) {
      case 'MMMM D, YYYY':
        return `${months[m]} ${d}, ${y}`;
      case 'DD/MM/YYYY':
        return `${pad(d)}/${pad(m + 1)}/${y}`;
      case 'MM/DD/YYYY':
        return `${pad(m + 1)}/${pad(d)}/${y}`;
      case 'YYYY-MM-DD':
        return `${y}-${pad(m + 1)}-${pad(d)}`;
      default:
        return `${d} ${months[m]} ${y}`;
    }
  }
}
