import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { marked } from 'marked';
import { PageComponent } from '../../shell/page/page';

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface ModelOption {
  id: string;
  label: string;
  size: string;
  blurb: string;
}

/** A small subset of web-llm's catalog; all run fully in the browser. */
const MODELS: readonly ModelOption[] = [
  { id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 1B', size: '~0.9 GB', blurb: 'Fastest to load. Fine for short answers.' },
  { id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 3B', size: '~2.3 GB', blurb: 'Better reasoning, noticeably slower to download.' },
  { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC', label: 'Phi 3.5 mini', size: '~2.1 GB', blurb: 'Strong at structured and technical answers.' }
];

const SUGGESTIONS = [
  'Explain design tokens to a new engineer.',
  'Write a changelog entry for a dark-mode fix.',
  'Suggest three empty-state messages for a data table.'
];

/**
 * In-browser chat via `@mlc-ai/web-llm`. The engine runs on WebGPU, so this
 * route degrades to an explanation when `navigator.gpu` is missing rather than
 * failing at import time. web-llm is dynamically imported to keep several
 * megabytes out of every other chunk.
 */
@Component({
  selector: 'app-ai-studio',
  imports: [PageComponent, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="AI Studio" description="A language model running entirely in this browser tab.">
      <ng-container actions>
        @if (turns().length) {
          <button matButton="outlined" type="button" (click)="clear()">New chat</button>
        }
      </ng-container>

      @if (!supported()) {
        <!-- No WebGPU -->
        <div class="mx-auto max-w-xl rounded-2xl border border-outline-variant bg-surface p-8 text-center">
          <span class="mx-auto grid size-14 place-items-center rounded-2xl bg-orange-container text-on-orange-container">
            <iconify-icon icon="solar:cpu-bolt-bold-duotone" width="30" height="30"></iconify-icon>
          </span>
          <h2 class="mt-5 text-lg font-semibold text-on-surface">WebGPU is not available</h2>
          <p class="mt-2 text-sm text-on-surface-variant">
            This page runs the model on your own GPU through WebGPU, so nothing you type leaves the
            machine. Your browser does not expose <code class="rounded bg-surface-container-highest px-1">navigator.gpu</code>,
            so there is nothing to run it on.
          </p>
          <p class="mt-3 text-sm text-on-surface-variant">
            Chrome or Edge 113+ on a machine with a supported GPU will enable it. Everything else in
            this app works regardless.
          </p>
        </div>
      } @else {
        <div class="flex flex-col gap-6 lg:flex-row">
          <!-- Chat -->
          <div class="flex min-w-0 flex-1 flex-col rounded-2xl border border-outline-variant bg-surface">
            <div #scroller class="min-h-[26rem] flex-1 overflow-y-auto p-5">
              @if (turns().length === 0) {
                <div class="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                  <span class="grid size-14 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
                    <iconify-icon icon="solar:magic-stick-3-bold-duotone" width="30" height="30"></iconify-icon>
                  </span>
                  <div>
                    <p class="text-base font-medium text-on-surface">Nothing here yet</p>
                    <p class="mt-1 text-sm text-on-surface-variant">
                      Load a model, then ask it something.
                    </p>
                  </div>
                  <div class="flex flex-col gap-2">
                    @for (suggestion of suggestions; track suggestion) {
                      <button
                        type="button"
                        class="rounded-xl border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                        (click)="draft.set(suggestion)">
                        {{ suggestion }}
                      </button>
                    }
                  </div>
                </div>
              } @else {
                <div class="flex flex-col gap-4">
                  @for (turn of turns(); track turn.id) {
                    <div class="flex" [class.justify-end]="turn.role === 'user'">
                      @if (turn.role === 'user') {
                        <div class="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-on-primary">
                          {{ turn.text }}
                        </div>
                      } @else {
                        <div class="flex max-w-[85%] gap-3">
                          <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-container text-on-primary-container">
                            <iconify-icon icon="solar:magic-stick-3-bold-duotone" width="17" height="17"></iconify-icon>
                          </span>
                          <div
                            class="prose prose-sm max-w-none rounded-2xl rounded-bl-md bg-surface-container px-4 py-2.5 text-on-surface dark:prose-invert"
                            [innerHTML]="render(turn.text)"></div>
                        </div>
                      }
                    </div>
                  }

                  @if (generating()) {
                    <p class="flex items-center gap-2 text-xs text-on-surface-variant">
                      <iconify-icon icon="solar:refresh-linear" width="14" height="14" class="animate-spin"></iconify-icon>
                      Generating…
                    </p>
                  }
                </div>
              }
            </div>

            <div class="border-t border-outline-variant p-3">
              <div class="flex items-end gap-2">
                <textarea
                  [(ngModel)]="draft"
                  rows="1"
                  [placeholder]="ready() ? 'Ask anything…' : 'Load a model first'"
                  [disabled]="!ready() || generating()"
                  aria-label="Prompt"
                  (keydown.enter)="onEnter($event)"
                  class="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"></textarea>
                <button
                  matIconButton
                  type="button"
                  class="!size-10 shrink-0"
                  [disabled]="!ready() || generating() || !draft().trim()"
                  (click)="send()"
                  aria-label="Send">
                  <iconify-icon icon="solar:plain-bold" width="20" height="20"></iconify-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Model panel -->
          <aside class="w-full shrink-0 lg:w-80" aria-label="Model settings">
            <div class="rounded-2xl border border-outline-variant bg-surface p-5">
              <h2 class="text-sm font-semibold text-on-surface">Model</h2>
              <p class="mt-1 text-xs text-on-surface-variant">
                Weights download once and are cached by the browser.
              </p>

              <div class="mt-4 flex flex-col gap-2">
                @for (model of models; track model.id) {
                  <button
                    type="button"
                    class="rounded-xl border p-3 text-left transition-colors"
                    [class]="
                      selected() === model.id
                        ? 'border-primary bg-surface-container'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    "
                    [disabled]="loading()"
                    [attr.aria-pressed]="selected() === model.id"
                    (click)="selected.set(model.id)">
                    <span class="flex items-center justify-between gap-2">
                      <span class="text-sm font-medium text-on-surface">{{ model.label }}</span>
                      <span class="shrink-0 text-[11px] tabular-nums text-on-surface-variant">{{ model.size }}</span>
                    </span>
                    <span class="mt-0.5 block text-xs text-on-surface-variant">{{ model.blurb }}</span>
                  </button>
                }
              </div>

              @if (loading()) {
                <div class="mt-4">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-on-surface-variant">Loading</span>
                    <span class="tabular-nums text-on-surface">{{ progressPct() }}%</span>
                  </div>
                  <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-highest">
                    <div class="h-full rounded-full bg-primary transition-[width]" [style.width.%]="progressPct()"></div>
                  </div>
                  <p class="mt-2 line-clamp-2 text-[11px] text-on-surface-variant">{{ progressText() }}</p>
                </div>
              } @else if (ready()) {
                <p class="mt-4 flex items-center gap-1.5 rounded-xl bg-green-container px-3 py-2 text-xs text-on-green-container">
                  <iconify-icon icon="solar:check-circle-bold" width="15" height="15"></iconify-icon>
                  Ready — running locally
                </p>
              } @else {
                <button matButton="filled" type="button" class="!mt-4 w-full" (click)="load()">
                  Load model
                </button>
              }

              @if (error(); as message) {
                <p class="mt-4 rounded-xl bg-red-container px-3 py-2 text-xs text-on-red-container">{{ message }}</p>
              }

              <p class="mt-4 border-t border-outline-variant pt-4 text-[11px] leading-relaxed text-on-surface-variant">
                Inference happens on your GPU. No prompt or response is sent to a server.
              </p>
            </div>
          </aside>
        </div>
      }
    </app-page>
  `
})
export class AiStudioComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly models = MODELS;
  protected readonly suggestions = SUGGESTIONS;

  protected readonly supported = signal(typeof navigator !== 'undefined' && 'gpu' in navigator);
  protected readonly selected = signal(MODELS[0].id);
  protected readonly loading = signal(false);
  protected readonly ready = signal(false);
  protected readonly generating = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly progress = signal(0);
  protected readonly progressText = signal('');
  protected readonly progressPct = computed(() => Math.round(this.progress() * 100));

  protected readonly draft = signal('');
  protected readonly turns = signal<ChatTurn[]>([]);

  /** Typed loosely: the engine's shape is only known after the dynamic import. */
  private engine: {
    chat: { completions: { create: (args: unknown) => Promise<unknown> } };
    unload?: () => Promise<void>;
  } | null = null;

  private counter = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => void this.engine?.unload?.());
  }

  protected render(markdown: string): SafeHtml {
    const html = marked.parse(markdown, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    this.progress.set(0);
    this.progressText.set('Fetching weights…');

    try {
      const webllm = await import('@mlc-ai/web-llm');
      this.engine = (await webllm.CreateMLCEngine(this.selected(), {
        initProgressCallback: (report: { progress: number; text: string }) => {
          this.progress.set(report.progress);
          this.progressText.set(report.text);
        }
      })) as unknown as typeof this.engine;
      this.ready.set(true);
    } catch (cause) {
      this.error.set(
        cause instanceof Error ? cause.message : 'The model failed to load. Try a smaller one.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey) return;
    keyboard.preventDefault();
    void this.send();
  }

  protected async send(): Promise<void> {
    const prompt = this.draft().trim();
    if (!prompt || !this.engine || this.generating()) return;

    this.draft.set('');
    this.push('user', prompt);
    const replyId = this.push('assistant', '');
    this.generating.set(true);

    try {
      const history = this.turns()
        .filter((turn) => turn.text)
        .map((turn) => ({ role: turn.role, content: turn.text }));

      const stream = (await this.engine.chat.completions.create({
        messages: history,
        stream: true,
        temperature: 0.7
      })) as AsyncIterable<{ choices: { delta: { content?: string } }[] }>;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (!delta) continue;
        this.turns.update((list) =>
          list.map((turn) => (turn.id === replyId ? { ...turn, text: turn.text + delta } : turn))
        );
        this.scrollToBottom();
      }
    } catch (cause) {
      this.error.set(cause instanceof Error ? cause.message : 'Generation failed.');
    } finally {
      this.generating.set(false);
      this.scrollToBottom();
    }
  }

  protected clear(): void {
    this.turns.set([]);
    this.error.set(null);
  }

  private push(role: ChatTurn['role'], text: string): string {
    this.counter += 1;
    const id = `turn-${this.counter}`;
    this.turns.update((list) => [...list, { id, role, text }]);
    this.scrollToBottom();
    return id;
  }

  private scrollToBottom(): void {
    queueMicrotask(() => {
      const element = this.scroller()?.nativeElement;
      if (element) element.scrollTop = element.scrollHeight;
    });
  }
}
