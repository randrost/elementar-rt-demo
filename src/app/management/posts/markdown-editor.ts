import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
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
 * of the posts-list chunk.
 *
 * Its ~85 kB of CSS is copied to `crepe-theme/` as a build asset and linked on
 * first use. Component styles would have pulled it into the eager budget, and
 * the global sheet would have shipped it to every visitor who never opens the
 * editor.
 */
const THEME_HREFS = ['crepe-theme/common/style.css', 'crepe-theme/frame/style.css'];

/** Appends Crepe's stylesheets once, however many editors mount. */
function ensureCrepeTheme(): void {
  for (const href of THEME_HREFS) {
    if (document.head.querySelector(`link[href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

@Component({
  selector: 'app-markdown-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Crepe styles its own DOM; scoping would not reach it.
  encapsulation: ViewEncapsulation.None,
  styles: `
    app-markdown-editor {
      display: block;
    }
    app-markdown-editor .host {
      min-height: 26rem;
    }
    /* Crepe paints its own surface; let it sit on the app's instead. */
    app-markdown-editor .milkdown {
      background: transparent;
      color: inherit;
    }
    app-markdown-editor .milkdown .ProseMirror {
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
    ensureCrepeTheme();
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
