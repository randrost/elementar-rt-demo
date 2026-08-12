import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';

/**
 * Milkdown Crepe editor.
 *
 * Crepe and its ProseMirror stack are large, so the module is imported
 * dynamically — it only downloads when this editor renders, which keeps it out
 * of the posts-list chunk. Its stylesheets are global (see `styles.scss`)
 * because Angular cannot import CSS from a TypeScript module.
 */
@Component({
  selector: 'app-markdown-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    .host {
      min-height: 26rem;
    }
    /* Crepe paints its own surface; let it sit on the app's instead. */
    :host ::ng-deep .milkdown {
      background: transparent;
      color: inherit;
    }
    :host ::ng-deep .milkdown .ProseMirror {
      padding: 1.25rem;
    }
  `,
  template: `<div #host class="host rounded-xl border border-outline-variant bg-surface"></div>`
})
export class MarkdownEditorComponent {
  readonly value = input<string>('');
  readonly valueChange = output<string>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private crepe?: { destroy: () => void };

  constructor() {
    afterNextRender(() => void this.boot());
    inject(DestroyRef).onDestroy(() => this.crepe?.destroy());
  }

  private async boot(): Promise<void> {
    const { Crepe } = await import('@milkdown/crepe');

    const crepe = new Crepe({
      root: this.host().nativeElement,
      defaultValue: this.value()
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => this.valueChange.emit(markdown));
    });

    await crepe.create();
    this.crepe = crepe;
  }
}
