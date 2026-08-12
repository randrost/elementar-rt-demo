import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageComponent } from '../../shell/page/page';

type DialogKind = 'confirm' | 'destructive' | 'form' | 'wide' | null;

@Component({
  selector: 'app-gallery-dialogs',
  imports: [PageComponent, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <app-page title="Dialogs" description="Confirm, destructive confirm, a form dialog, and a wide one.">
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        @for (item of kinds; track item.id) {
          <section class="flex flex-col rounded-2xl border border-outline-variant bg-surface p-5">
            <span class="grid size-10 place-items-center rounded-xl bg-primary-container text-on-primary-container">
              <iconify-icon [icon]="item.icon" width="22" height="22"></iconify-icon>
            </span>
            <h2 class="mt-4 text-sm font-semibold text-on-surface">{{ item.title }}</h2>
            <p class="mt-1 flex-1 text-sm text-on-surface-variant">{{ item.blurb }}</p>
            <button matButton="outlined" type="button" class="!mt-4" (click)="open(item.id)">Open</button>
          </section>
        }
      </div>
    </app-page>

    @if (kind(); as active) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="close()" aria-label="Close"></button>

        <div
          class="relative w-full rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl"
          [class]="active === 'wide' ? 'max-w-2xl' : 'max-w-md'">
          @switch (active) {
            @case ('confirm') {
              <h2 class="text-lg font-semibold text-on-surface">Publish this post?</h2>
              <p class="mt-2 text-sm text-on-surface-variant">
                It becomes visible to everyone with access to the workspace. You can unpublish later.
              </p>
              <div class="mt-6 flex justify-end gap-2">
                <button matButton type="button" (click)="close()">Cancel</button>
                <button matButton="filled" type="button" (click)="confirm('Post published')">Publish</button>
              </div>
            }

            @case ('destructive') {
              <div class="flex items-start gap-3">
                <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-red-container text-on-red-container">
                  <iconify-icon icon="solar:danger-triangle-bold-duotone" width="22" height="22"></iconify-icon>
                </span>
                <div>
                  <h2 class="text-lg font-semibold text-on-surface">Delete workspace?</h2>
                  <p class="mt-2 text-sm text-on-surface-variant">
                    This removes every project, invoice, and file. It cannot be undone.
                  </p>
                </div>
              </div>

              <label class="mt-5 block text-xs font-medium text-on-surface-variant" for="confirm-name">
                Type <span class="font-semibold text-on-surface">elementar-rt</span> to confirm
              </label>
              <input
                id="confirm-name"
                [(ngModel)]="typed"
                class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />

              <div class="mt-6 flex justify-end gap-2">
                <button matButton type="button" (click)="close()">Cancel</button>
                <button
                  matButton="filled"
                  type="button"
                  [disabled]="typed() !== 'elementar-rt'"
                  (click)="confirm('Workspace deleted')">
                  Delete forever
                </button>
              </div>
            }

            @case ('form') {
              <h2 class="text-lg font-semibold text-on-surface">Invite a teammate</h2>
              <p class="mt-1 text-sm text-on-surface-variant">They get a link that expires in seven days.</p>

              <label class="mt-5 block text-xs font-medium text-on-surface-variant" for="invite-email">Email</label>
              <input
                id="invite-email"
                type="email"
                [(ngModel)]="email"
                placeholder="teammate@company.com"
                class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />

              <span class="mt-4 block text-xs font-medium text-on-surface-variant">Role</span>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                @for (option of roles; track option) {
                  <button
                    type="button"
                    class="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                    [class]="
                      role() === option
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                    "
                    (click)="role.set(option)">
                    {{ option }}
                  </button>
                }
              </div>

              <div class="mt-6 flex justify-end gap-2">
                <button matButton type="button" (click)="close()">Cancel</button>
                <button matButton="filled" type="button" [disabled]="!email().includes('@')" (click)="confirm('Invitation sent')">
                  Send invite
                </button>
              </div>
            }

            @case ('wide') {
              <h2 class="text-lg font-semibold text-on-surface">Keyboard shortcuts</h2>
              <p class="mt-1 text-sm text-on-surface-variant">A wide dialog for reference content.</p>

              <div class="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                @for (row of shortcuts; track row.keys) {
                  <div class="flex items-center justify-between gap-4 border-b border-outline-variant py-2">
                    <span class="text-sm text-on-surface-variant">{{ row.label }}</span>
                    <kbd class="rounded-md border border-outline-variant bg-surface-container px-2 py-0.5 text-xs text-on-surface">
                      {{ row.keys }}
                    </kbd>
                  </div>
                }
              </div>

              <div class="mt-6 flex justify-end">
                <button matButton="filled" type="button" (click)="close()">Got it</button>
              </div>
            }
          }
        </div>
      </div>
    }
  `
})
export class GalleryDialogsComponent {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly kind = signal<DialogKind>(null);
  protected readonly typed = signal('');
  protected readonly email = signal('');
  protected readonly role = signal('Member');

  protected readonly roles = ['Viewer', 'Member', 'Editor', 'Admin'];

  protected readonly kinds: readonly { id: Exclude<DialogKind, null>; title: string; blurb: string; icon: string }[] = [
    { id: 'confirm', title: 'Confirm', blurb: 'A reversible action that still deserves a beat of thought.', icon: 'solar:question-circle-bold-duotone' },
    { id: 'destructive', title: 'Destructive', blurb: 'Irreversible. Requires typing the name to confirm.', icon: 'solar:trash-bin-trash-bold-duotone' },
    { id: 'form', title: 'Form', blurb: 'A short form that does not warrant its own page.', icon: 'solar:user-plus-bold-duotone' },
    { id: 'wide', title: 'Wide', blurb: 'Reference content that needs two columns.', icon: 'solar:widget-4-bold-duotone' }
  ];

  protected readonly shortcuts = [
    { label: 'Command palette', keys: 'Ctrl K' },
    { label: 'Toggle sidebar', keys: 'Ctrl B' },
    { label: 'New post', keys: 'Ctrl N' },
    { label: 'Search', keys: '/' },
    { label: 'Toggle theme', keys: 'Ctrl J' },
    { label: 'Close dialog', keys: 'Esc' }
  ];

  protected open(kind: Exclude<DialogKind, null>): void {
    this.typed.set('');
    this.email.set('');
    this.role.set('Member');
    this.kind.set(kind);
  }

  protected close(): void {
    this.kind.set(null);
  }

  protected confirm(message: string): void {
    this.close();
    this.snackBar.open(message, 'Dismiss', { duration: 3000 });
  }
}
