import { Injectable, computed, signal } from '@angular/core';
import { randomId } from '../../shared/mock/mock';

export type BlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'divider' | 'embed';

export interface BlockBase {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph';
  text: string;
  align: 'left' | 'center' | 'right';
}

export interface HeadingBlock extends BlockBase {
  type: 'heading';
  text: string;
  level: 1 | 2 | 3;
}

export interface ImageBlock extends BlockBase {
  type: 'image';
  /** A gradient stands in for real artwork so the doc stays self-contained. */
  gradient: string;
  caption: string;
  ratio: 'wide' | 'square';
}

export interface QuoteBlock extends BlockBase {
  type: 'quote';
  text: string;
  attribution: string;
}

export interface DividerBlock extends BlockBase {
  type: 'divider';
  style: 'line' | 'dots';
}

export interface EmbedBlock extends BlockBase {
  type: 'embed';
  provider: 'video' | 'gist' | 'map';
  url: string;
  title: string;
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | QuoteBlock
  | DividerBlock
  | EmbedBlock;

export const BLOCK_META: Record<BlockType, { label: string; icon: string; hint: string }> = {
  paragraph: { label: 'Paragraph', icon: 'solar:text-linear', hint: 'Body copy' },
  heading: { label: 'Heading', icon: 'solar:text-bold-square-linear', hint: 'Section title' },
  image: { label: 'Image', icon: 'solar:gallery-linear', hint: 'Figure with caption' },
  quote: { label: 'Quote', icon: 'solar:quote-up-square-linear', hint: 'Pull quote' },
  divider: { label: 'Divider', icon: 'solar:minus-square-linear', hint: 'Section break' },
  embed: { label: 'Embed', icon: 'solar:link-square-linear', hint: 'External content' }
};

export const IMAGE_GRADIENTS = [
  'from-indigo-500 to-sky-400',
  'from-violet-500 to-pink-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-red-400'
];

const SEED: Block[] = [
  { id: 'b1', type: 'heading', text: 'Designing an admin shell that gets out of the way', level: 1 },
  {
    id: 'b2',
    type: 'paragraph',
    align: 'left',
    text: 'Most admin interfaces fail in the same place: they treat every screen as a chance to show what the system can do, rather than what the person came to do. The shell should be near-invisible — navigation you stop noticing after a day, and a content area that never fights you for space.'
  },
  { id: 'b3', type: 'image', gradient: IMAGE_GRADIENTS[0], caption: 'The shell at its default width, sidebar expanded.', ratio: 'wide' },
  { id: 'b4', type: 'heading', text: 'Density is a decision, not a default', level: 2 },
  {
    id: 'b5',
    type: 'paragraph',
    align: 'left',
    text: 'Density arguments usually stall because both sides are right about different users. The operator running the same query forty times a day wants rows tight enough to scan without scrolling. The occasional visitor wants breathing room. Ship a toggle, remember the choice, and stop arguing.'
  },
  {
    id: 'b6',
    type: 'quote',
    text: 'If a setting resolves a disagreement your team has had twice, it has already paid for itself.',
    attribution: 'Ada Lovelace, Chief Engineer'
  },
  { id: 'b7', type: 'divider', style: 'line' },
  {
    id: 'b8',
    type: 'paragraph',
    align: 'left',
    text: 'The same logic applies to colour scheme. Deriving dark mode from tokens rather than hand-authoring it means the two stay in step as the palette moves, and nobody has to remember to update a second stylesheet.'
  },
  { id: 'b9', type: 'embed', provider: 'video', url: 'https://example.com/walkthrough', title: 'Shell walkthrough (4:12)' }
];

/**
 * The document model behind the block editor. Blocks are a flat ordered list —
 * nesting buys very little for this kind of content and costs a lot in editing
 * affordances.
 */
@Injectable({ providedIn: 'root' })
export class DocumentStore {
  private readonly state = signal<Block[]>(SEED);
  readonly blocks = this.state.asReadonly();

  readonly json = computed(() => JSON.stringify(this.state(), null, 2));

  readonly wordCount = computed(() =>
    this.state().reduce((sum, block) => {
      const text = 'text' in block ? block.text : '';
      return sum + (text.trim() ? text.trim().split(/\s+/).length : 0);
    }, 0)
  );

  setBlocks(blocks: Block[]): void {
    this.state.set(blocks);
  }

  add(type: BlockType, afterId?: string): string {
    const block = this.create(type);
    this.state.update((list) => {
      if (!afterId) return [...list, block];
      const index = list.findIndex((item) => item.id === afterId);
      if (index === -1) return [...list, block];
      const copy = [...list];
      copy.splice(index + 1, 0, block);
      return copy;
    });
    return block.id;
  }

  patch(id: string, changes: Partial<Block>): void {
    this.state.update((list) =>
      list.map((block) => (block.id === id ? ({ ...block, ...changes } as Block) : block))
    );
  }

  remove(id: string): void {
    this.state.update((list) => list.filter((block) => block.id !== id));
  }

  duplicate(id: string): void {
    this.state.update((list) => {
      const index = list.findIndex((block) => block.id === id);
      if (index === -1) return list;
      const copy = [...list];
      copy.splice(index + 1, 0, { ...list[index], id: randomId('b-') });
      return copy;
    });
  }

  private create(type: BlockType): Block {
    const id = randomId('b-');
    switch (type) {
      case 'heading':
        return { id, type, text: 'New heading', level: 2 };
      case 'image':
        return { id, type, gradient: IMAGE_GRADIENTS[0], caption: '', ratio: 'wide' };
      case 'quote':
        return { id, type, text: 'Something worth pulling out.', attribution: '' };
      case 'divider':
        return { id, type, style: 'line' };
      case 'embed':
        return { id, type, provider: 'video', url: '', title: 'Untitled embed' };
      default:
        return { id, type: 'paragraph', text: '', align: 'left' };
    }
  }
}
