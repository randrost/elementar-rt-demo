import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { Contact, ContactsService } from './mock-data';

@Component({
  selector: 'app-contacts',
  imports: [PageComponent, FormsModule, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Contacts" description="Everyone you work with, in one place.">
      <div class="flex h-[calc(100vh-13rem)] min-h-[32rem] gap-6">
        <!-- List pane -->
        <div
          class="flex w-full flex-col rounded-2xl border border-outline-variant bg-surface lg:w-96 lg:shrink-0"
          [class.hidden]="selected() && narrowShowsDetail()"
          [class.lg:flex]="true">
          <div class="border-b border-outline-variant p-4">
            <div class="relative">
              <iconify-icon
                icon="solar:magnifer-linear"
                width="18"
                height="18"
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"></iconify-icon>
              <input
                type="search"
                [(ngModel)]="query"
                placeholder="Search contacts…"
                aria-label="Search contacts"
                class="w-full rounded-xl border border-outline-variant bg-surface py-2 pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary" />
            </div>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                [class]="chipClass(tag() === null)"
                (click)="tag.set(null)">
                All
              </button>
              @for (name of allTags; track name) {
                <button
                  type="button"
                  class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                  [class]="chipClass(tag() === name)"
                  (click)="tag.set(name)">
                  {{ name }}
                </button>
              }
            </div>
          </div>

          <ul class="flex-1 overflow-y-auto p-2">
            @for (contact of filtered(); track contact.id) {
              <li>
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors"
                  [class]="
                    selected()?.id === contact.id ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                  "
                  (click)="select(contact)">
                  <img [src]="avatar(contact.avatarSeed)" alt="" class="size-10 shrink-0 rounded-full" />
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-on-surface">{{ contact.name }}</span>
                    <span class="block truncate text-xs text-on-surface-variant">{{ contact.company }}</span>
                  </span>
                  @if (contact.favorite) {
                    <iconify-icon icon="solar:star-bold" width="15" height="15" class="shrink-0 text-amber-500"></iconify-icon>
                  }
                </button>
              </li>
            } @empty {
              <li class="px-3 py-12 text-center text-sm text-on-surface-variant">No contacts match that search.</li>
            }
          </ul>

          <p class="border-t border-outline-variant px-4 py-2.5 text-xs text-on-surface-variant">
            {{ filtered().length }} of {{ contacts().length }} contacts
          </p>
        </div>

        <!-- Detail pane -->
        @if (selected(); as contact) {
          <div class="flex w-full flex-col overflow-y-auto rounded-2xl border border-outline-variant bg-surface">
            <!-- Not position:relative — a positioned banner paints above the
                 static avatar below it and clips its top half off. The top
                 rounding keeps its square corners inside the card border. -->
            <div class="h-28 shrink-0 rounded-t-2xl bg-primary-container"></div>

            <div class="px-6 pb-6">
              <!-- Only the avatar overlaps the banner. Pulling the whole row up
                   put the name and actions on top of the tint once they wrapped. -->
              <img
                [src]="avatar(contact.avatarSeed)"
                alt=""
                class="relative -mt-10 block size-20 rounded-full border-4 border-surface bg-surface-container" />

              <div class="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold text-on-surface">{{ contact.name }}</h2>
                  <p class="text-sm text-on-surface-variant">{{ contact.role }} · {{ contact.company }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    matIconButton
                    type="button"
                    (click)="store.toggleFavorite(contact.id)"
                    [attr.aria-label]="contact.favorite ? 'Remove from favourites' : 'Add to favourites'">
                    <iconify-icon
                      [icon]="contact.favorite ? 'solar:star-bold' : 'solar:star-linear'"
                      width="20"
                      height="20"
                      [class]="contact.favorite ? 'text-amber-500' : ''"></iconify-icon>
                  </button>
                  <button matButton="outlined" type="button" class="lg:!hidden" (click)="clearSelection()">Back</button>
                  <a matButton="filled" [href]="'mailto:' + contact.email">Send email</a>
                </div>
              </div>

              <dl class="mt-8 grid gap-px overflow-hidden rounded-2xl border border-outline-variant bg-outline-variant sm:grid-cols-2">
                @for (field of fields(contact); track field.label) {
                  <div class="flex items-start gap-3 bg-surface p-4">
                    <iconify-icon [icon]="field.icon" width="20" height="20" class="mt-0.5 shrink-0 text-primary"></iconify-icon>
                    <div class="min-w-0">
                      <dt class="text-xs text-on-surface-variant">{{ field.label }}</dt>
                      <dd class="truncate text-sm text-on-surface">{{ field.value }}</dd>
                    </div>
                  </div>
                }
              </dl>

              <div class="mt-6">
                <h3 class="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Tags</h3>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  @for (name of contact.tags; track name) {
                    <span class="rounded-full bg-surface-container-highest px-2.5 py-1 text-xs text-on-surface-variant">
                      {{ name }}
                    </span>
                  }
                </div>
              </div>

              <p class="mt-6 text-xs text-on-surface-variant">
                Last contacted {{ contact.lastContacted | date: 'mediumDate' }}
              </p>
            </div>
          </div>
        } @else {
          <div class="hidden w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant text-center lg:flex">
            <iconify-icon icon="solar:users-group-rounded-bold-duotone" width="44" height="44" class="text-primary"></iconify-icon>
            <p class="text-sm text-on-surface-variant">Pick a contact to see their details.</p>
          </div>
        }
      </div>
    </app-page>
  `
})
export class ContactsComponent {
  protected readonly store = inject(ContactsService);
  private readonly avatars = inject(AvatarService);

  protected readonly contacts = this.store.contacts;
  protected readonly allTags = this.store.tags();

  protected readonly query = signal('');
  protected readonly tag = signal<string | null>(null);
  private readonly selectedId = signal<string | null>('contact-1');
  /** Below lg the panes share the same column, so only one shows at a time. */
  protected readonly narrowShowsDetail = signal(false);

  protected readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    const tag = this.tag();
    return this.contacts().filter((contact) => {
      if (tag && !contact.tags.includes(tag)) return false;
      if (!term) return true;
      return (
        contact.name.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.company.toLowerCase().includes(term)
      );
    });
  });

  protected readonly selected = computed(
    () => this.contacts().find((contact) => contact.id === this.selectedId()) ?? null
  );

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected chipClass(active: boolean): string {
    return active
      ? 'border-primary bg-primary text-on-primary'
      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low';
  }

  protected select(contact: Contact): void {
    this.selectedId.set(contact.id);
    this.narrowShowsDetail.set(true);
  }

  protected clearSelection(): void {
    this.narrowShowsDetail.set(false);
  }

  protected fields(contact: Contact) {
    return [
      { label: 'Email', value: contact.email, icon: 'solar:letter-bold-duotone' },
      { label: 'Phone', value: contact.phone, icon: 'solar:phone-bold-duotone' },
      { label: 'Company', value: contact.company, icon: 'solar:buildings-2-bold-duotone' },
      { label: 'Location', value: contact.location, icon: 'solar:map-point-bold-duotone' }
    ];
  }
}
