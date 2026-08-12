import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import {
  Block,
  BLOCK_META,
  BlockType,
  DocumentStore,
  EmbedBlock,
  HeadingBlock,
  IMAGE_GRADIENTS,
  ImageBlock,
  ParagraphBlock,
  QuoteBlock
} from './document.store';

const TYPES = Object.keys(BLOCK_META) as BlockType[];

@Component({
  selector: 'app-content-editor',
  imports: [PageComponent, FormsModule, MatButtonModule, CdkDropList, CdkDrag, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    .cdk-drag-preview {
      box-shadow:
        0 10px 30px rgb(0 0 0 / 0.2),
        0 3px 8px rgb(0 0 0 / 0.1);
    }
    .cdk-drag-placeholder {
      opacity: 0.4;
    }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
  template: `
    <app-page title="Content editor" description="A block document. Drag to reorder, click a block to edit it.">
      <ng-container actions>
        <div class="flex rounded-xl border border-outline-variant p-0.5" role="group" aria-label="Mode">
          @for (option of modes; track option.id) {
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              [class]="mode() === option.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
              [attr.aria-pressed]="mode() === option.id"
              (click)="mode.set(option.id)">
              {{ option.label }}
            </button>
          }
        </div>
      </ng-container>

      @if (mode() === 'json') {
        <pre class="overflow-x-auto rounded-2xl border border-outline-variant bg-surface p-5 text-xs leading-relaxed text-on-surface">{{ store.json() }}</pre>
      } @else {
        <div class="flex flex-col gap-6 lg:flex-row">
          <!-- Document -->
          <div class="min-w-0 flex-1">
            <div
              cdkDropList
              [cdkDropListData]="store.blocks()"
              (cdkDropListDropped)="drop($event)"
              class="flex flex-col gap-2">
              @for (block of store.blocks(); track block.id) {
                <article
                  cdkDrag
                  class="group relative rounded-xl border p-4 transition-colors"
                  [class]="
                    preview()
                      ? 'border-transparent'
                      : selectedId() === block.id
                        ? 'border-primary bg-surface'
                        : 'border-transparent hover:border-outline-variant hover:bg-surface'
                  "
                  (click)="select(block.id)">
                  @if (!preview()) {
                    <div class="absolute -left-1 top-3 flex -translate-x-full flex-col gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <button
                        cdkDragHandle
                        type="button"
                        class="grid size-7 cursor-move place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        [attr.aria-label]="'Reorder ' + meta(block).label">
                        <iconify-icon icon="solar:hamburger-menu-linear" width="15" height="15"></iconify-icon>
                      </button>
                      <button
                        type="button"
                        class="grid size-7 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        (click)="duplicate($event, block.id)"
                        [attr.aria-label]="'Duplicate ' + meta(block).label">
                        <iconify-icon icon="solar:copy-linear" width="15" height="15"></iconify-icon>
                      </button>
                      <button
                        type="button"
                        class="grid size-7 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-red-700 dark:hover:text-red-400"
                        (click)="remove($event, block.id)"
                        [attr.aria-label]="'Delete ' + meta(block).label">
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="15" height="15"></iconify-icon>
                      </button>
                    </div>
                  }

                  @switch (block.type) {
                    @case ('heading') {
                      @let heading = asHeading(block);
                      @if (heading.level === 1) {
                        <h1 class="text-3xl font-semibold tracking-tight text-on-surface">{{ heading.text }}</h1>
                      } @else if (heading.level === 2) {
                        <h2 class="text-2xl font-semibold tracking-tight text-on-surface">{{ heading.text }}</h2>
                      } @else {
                        <h3 class="text-xl font-semibold text-on-surface">{{ heading.text }}</h3>
                      }
                    }
                    @case ('paragraph') {
                      @let para = asParagraph(block);
                      <p class="text-[15px] leading-relaxed text-on-surface-variant" [style.text-align]="para.align">
                        {{ para.text || 'Empty paragraph' }}
                      </p>
                    }
                    @case ('image') {
                      @let image = asImage(block);
                      <figure>
                        <div
                          class="w-full rounded-xl bg-gradient-to-br"
                          [class]="image.gradient + ' ' + (image.ratio === 'wide' ? 'aspect-[16/7]' : 'aspect-square')"></div>
                        @if (image.caption) {
                          <figcaption class="mt-2 text-center text-xs text-on-surface-variant">{{ image.caption }}</figcaption>
                        }
                      </figure>
                    }
                    @case ('quote') {
                      @let quote = asQuote(block);
                      <blockquote class="border-l-4 border-primary pl-4">
                        <p class="text-lg italic leading-relaxed text-on-surface">{{ quote.text }}</p>
                        @if (quote.attribution) {
                          <footer class="mt-2 text-sm text-on-surface-variant">— {{ quote.attribution }}</footer>
                        }
                      </blockquote>
                    }
                    @case ('divider') {
                      @if (asDividerStyle(block) === 'dots') {
                        <div class="flex justify-center gap-2 py-2" aria-hidden="true">
                          @for (dot of [0, 1, 2]; track dot) {
                            <span class="size-1.5 rounded-full bg-outline-variant"></span>
                          }
                        </div>
                      } @else {
                        <hr class="border-outline-variant" />
                      }
                    }
                    @case ('embed') {
                      @let embed = asEmbed(block);
                      <div class="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4">
                        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-container text-on-primary-container">
                          <iconify-icon [icon]="embedIcon(embed.provider)" width="20" height="20"></iconify-icon>
                        </span>
                        <div class="min-w-0">
                          <p class="truncate text-sm font-medium text-on-surface">{{ embed.title }}</p>
                          <p class="truncate text-xs text-on-surface-variant">{{ embed.url || 'No URL set' }}</p>
                        </div>
                      </div>
                    }
                  }
                </article>
              }
            </div>

            @if (!preview()) {
              <div class="mt-4">
                <p class="mb-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant">Add a block</p>
                <div class="flex flex-wrap gap-2">
                  @for (type of types; track type) {
                    <button
                      type="button"
                      class="flex items-center gap-2 rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                      (click)="add(type)">
                      <iconify-icon [icon]="typeMeta(type).icon" width="17" height="17"></iconify-icon>
                      {{ typeMeta(type).label }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Settings -->
          @if (!preview()) {
            <aside class="w-full shrink-0 lg:w-80" aria-label="Block settings">
              <div class="sticky top-6 rounded-2xl border border-outline-variant bg-surface p-5">
                @if (selected(); as block) {
                  <div class="flex items-center gap-2">
                    <iconify-icon [icon]="meta(block).icon" width="18" height="18" class="text-primary"></iconify-icon>
                    <h2 class="text-sm font-semibold text-on-surface">{{ meta(block).label }}</h2>
                  </div>

                  @switch (block.type) {
                    @case ('heading') {
                      @let heading = asHeading(block);
                      <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="h-text">Text</label>
                      <input
                        id="h-text"
                        [ngModel]="heading.text"
                        (ngModelChange)="store.patch(block.id, { text: $event })"
                        class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />

                      <span class="mt-4 block text-xs font-medium text-on-surface-variant">Level</span>
                      <div class="mt-1.5 flex gap-1.5">
                        @for (level of levels; track level) {
                          <button
                            type="button"
                            class="flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors"
                            [class]="chip(heading.level === level)"
                            (click)="store.patch(block.id, { level: level })">
                            H{{ level }}
                          </button>
                        }
                      </div>
                    }
                    @case ('paragraph') {
                      @let para = asParagraph(block);
                      <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="p-text">Text</label>
                      <textarea
                        id="p-text"
                        rows="7"
                        [ngModel]="para.text"
                        (ngModelChange)="store.patch(block.id, { text: $event })"
                        class="mt-1.5 w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"></textarea>

                      <span class="mt-4 block text-xs font-medium text-on-surface-variant">Alignment</span>
                      <div class="mt-1.5 flex gap-1.5">
                        @for (align of aligns; track align) {
                          <button
                            type="button"
                            class="flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors"
                            [class]="chip(para.align === align)"
                            (click)="store.patch(block.id, { align: align })">
                            {{ align }}
                          </button>
                        }
                      </div>
                    }
                    @case ('image') {
                      @let image = asImage(block);
                      <span class="mt-4 block text-xs font-medium text-on-surface-variant">Artwork</span>
                      <div class="mt-1.5 flex flex-wrap gap-2">
                        @for (gradient of gradients; track gradient) {
                          <button
                            type="button"
                            class="size-9 rounded-lg bg-gradient-to-br ring-offset-2 ring-offset-surface transition-all"
                            [class]="gradient + (image.gradient === gradient ? ' ring-2 ring-primary' : '')"
                            (click)="store.patch(block.id, { gradient: gradient })"
                            [attr.aria-label]="'Use gradient ' + gradient"></button>
                        }
                      </div>

                      <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="i-caption">Caption</label>
                      <input
                        id="i-caption"
                        [ngModel]="image.caption"
                        (ngModelChange)="store.patch(block.id, { caption: $event })"
                        class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />

                      <span class="mt-4 block text-xs font-medium text-on-surface-variant">Ratio</span>
                      <div class="mt-1.5 flex gap-1.5">
                        @for (ratio of ratios; track ratio) {
                          <button
                            type="button"
                            class="flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors"
                            [class]="chip(image.ratio === ratio)"
                            (click)="store.patch(block.id, { ratio: ratio })">
                            {{ ratio }}
                          </button>
                        }
                      </div>
                    }
                    @case ('quote') {
                      @let quote = asQuote(block);
                      <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="q-text">Quote</label>
                      <textarea
                        id="q-text"
                        rows="4"
                        [ngModel]="quote.text"
                        (ngModelChange)="store.patch(block.id, { text: $event })"
                        class="mt-1.5 w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"></textarea>

                      <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="q-attr">Attribution</label>
                      <input
                        id="q-attr"
                        [ngModel]="quote.attribution"
                        (ngModelChange)="store.patch(block.id, { attribution: $event })"
                        class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
                    }
                    @case ('divider') {
                      <span class="mt-4 block text-xs font-medium text-on-surface-variant">Style</span>
                      <div class="mt-1.5 flex gap-1.5">
                        @for (style of dividerStyles; track style) {
                          <button
                            type="button"
                            class="flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors"
                            [class]="chip(asDividerStyle(block) === style)"
                            (click)="store.patch(block.id, { style: style })">
                            {{ style }}
                          </button>
                        }
                      </div>
                    }
                    @case ('embed') {
                      @let embed = asEmbed(block);
                      <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="e-title">Title</label>
                      <input
                        id="e-title"
                        [ngModel]="embed.title"
                        (ngModelChange)="store.patch(block.id, { title: $event })"
                        class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />

                      <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="e-url">URL</label>
                      <input
                        id="e-url"
                        [ngModel]="embed.url"
                        (ngModelChange)="store.patch(block.id, { url: $event })"
                        class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />

                      <span class="mt-4 block text-xs font-medium text-on-surface-variant">Provider</span>
                      <div class="mt-1.5 flex gap-1.5">
                        @for (provider of providers; track provider) {
                          <button
                            type="button"
                            class="flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors"
                            [class]="chip(embed.provider === provider)"
                            (click)="store.patch(block.id, { provider: provider })">
                            {{ provider }}
                          </button>
                        }
                      </div>
                    }
                  }

                  <p class="mt-5 border-t border-outline-variant pt-4 text-xs text-on-surface-variant">
                    {{ store.blocks().length }} blocks · {{ store.wordCount() }} words
                  </p>
                } @else {
                  <div class="flex flex-col items-center gap-3 py-6 text-center">
                    <iconify-icon icon="solar:cursor-square-bold-duotone" width="34" height="34" class="text-primary"></iconify-icon>
                    <p class="text-sm text-on-surface-variant">Select a block to edit its settings.</p>
                  </div>
                }
              </div>
            </aside>
          }
        </div>
      }
    </app-page>
  `
})
export class ContentEditorComponent {
  protected readonly store = inject(DocumentStore);

  protected readonly types = TYPES;
  protected readonly gradients = IMAGE_GRADIENTS;
  protected readonly levels = [1, 2, 3] as const;
  protected readonly aligns = ['left', 'center', 'right'] as const;
  protected readonly ratios = ['wide', 'square'] as const;
  protected readonly dividerStyles = ['line', 'dots'] as const;
  protected readonly providers = ['video', 'gist', 'map'] as const;

  protected readonly modes = [
    { id: 'edit' as const, label: 'Edit' },
    { id: 'preview' as const, label: 'Preview' },
    { id: 'json' as const, label: 'JSON' }
  ];

  protected readonly mode = signal<'edit' | 'preview' | 'json'>('edit');
  protected readonly preview = computed(() => this.mode() !== 'edit');

  protected readonly selectedId = signal<string | null>(null);
  protected readonly selected = computed(
    () => this.store.blocks().find((block) => block.id === this.selectedId()) ?? null
  );

  protected meta(block: Block) {
    return BLOCK_META[block.type];
  }

  protected typeMeta(type: BlockType) {
    return BLOCK_META[type];
  }

  protected chip(active: boolean): string {
    return active
      ? 'border-primary bg-primary text-on-primary'
      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low';
  }

  protected embedIcon(provider: EmbedBlock['provider']): string {
    return provider === 'video'
      ? 'solar:play-circle-bold-duotone'
      : provider === 'map'
        ? 'solar:map-point-bold-duotone'
        : 'solar:code-square-bold-duotone';
  }

  /* Narrowing helpers — @switch does not refine the union in templates. */
  protected asHeading(block: Block): HeadingBlock {
    return block as HeadingBlock;
  }
  protected asParagraph(block: Block): ParagraphBlock {
    return block as ParagraphBlock;
  }
  protected asImage(block: Block): ImageBlock {
    return block as ImageBlock;
  }
  protected asQuote(block: Block): QuoteBlock {
    return block as QuoteBlock;
  }
  protected asEmbed(block: Block): EmbedBlock {
    return block as EmbedBlock;
  }
  protected asDividerStyle(block: Block): 'line' | 'dots' {
    return (block as { style?: 'line' | 'dots' }).style ?? 'line';
  }

  protected select(id: string): void {
    if (!this.preview()) this.selectedId.set(id);
  }

  protected add(type: BlockType): void {
    this.selectedId.set(this.store.add(type, this.selectedId() ?? undefined));
  }

  protected duplicate(event: Event, id: string): void {
    event.stopPropagation();
    this.store.duplicate(id);
  }

  protected remove(event: Event, id: string): void {
    event.stopPropagation();
    if (this.selectedId() === id) this.selectedId.set(null);
    this.store.remove(id);
  }

  protected drop(event: CdkDragDrop<Block[]>): void {
    const blocks = [...this.store.blocks()];
    moveItemInArray(blocks, event.previousIndex, event.currentIndex);
    this.store.setBlocks(blocks);
  }
}
