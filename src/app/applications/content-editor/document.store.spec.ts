import { TestBed } from '@angular/core/testing';
import { Block, DocumentStore } from './document.store';

describe('DocumentStore', () => {
  let store: DocumentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(DocumentStore);
  });

  it('starts with a seeded document', () => {
    expect(store.blocks().length).toBeGreaterThan(0);
  });

  it('counts words across text blocks', () => {
    store.setBlocks([
      { id: 'a', type: 'paragraph', text: 'one two three', align: 'left' },
      { id: 'b', type: 'heading', text: 'four five', level: 2 },
      { id: 'c', type: 'divider', style: 'line' }
    ]);
    expect(store.wordCount()).toBe(5);
  });

  it('counts an empty document as zero words', () => {
    store.setBlocks([]);
    expect(store.wordCount()).toBe(0);
  });

  it('serialises to JSON', () => {
    store.setBlocks([{ id: 'a', type: 'divider', style: 'dots' }]);
    expect(JSON.parse(store.json())).toEqual([{ id: 'a', type: 'divider', style: 'dots' }]);
  });

  it('appends a block when no anchor is given', () => {
    store.setBlocks([{ id: 'a', type: 'divider', style: 'line' }]);
    const id = store.add('paragraph');
    expect(store.blocks().at(-1)?.id).toBe(id);
  });

  it('inserts directly after the anchor', () => {
    store.setBlocks([
      { id: 'a', type: 'divider', style: 'line' },
      { id: 'b', type: 'divider', style: 'line' }
    ]);
    const id = store.add('quote', 'a');
    expect(store.blocks().map((block) => block.id)).toEqual(['a', id, 'b']);
  });

  it('creates each block type with sensible defaults', () => {
    store.setBlocks([]);
    for (const type of ['paragraph', 'heading', 'image', 'quote', 'divider', 'embed'] as const) {
      const id = store.add(type);
      const block = store.blocks().find((b) => b.id === id) as Block;
      expect(block.type).toBe(type);
    }
  });

  it('patches a block without touching its neighbours', () => {
    store.setBlocks([
      { id: 'a', type: 'paragraph', text: 'before', align: 'left' },
      { id: 'b', type: 'paragraph', text: 'untouched', align: 'left' }
    ]);
    store.patch('a', { text: 'after' } as Partial<Block>);

    const texts = store.blocks().map((block) => (block as { text?: string }).text);
    expect(texts).toEqual(['after', 'untouched']);
  });

  it('removes a block', () => {
    store.setBlocks([
      { id: 'a', type: 'divider', style: 'line' },
      { id: 'b', type: 'divider', style: 'line' }
    ]);
    store.remove('a');
    expect(store.blocks().map((block) => block.id)).toEqual(['b']);
  });

  it('duplicates a block with a fresh id, directly after it', () => {
    store.setBlocks([{ id: 'a', type: 'quote', text: 'q', attribution: '' }]);
    store.duplicate('a');

    const blocks = store.blocks();
    expect(blocks.length).toBe(2);
    expect(blocks[1].id).not.toBe('a');
    expect((blocks[1] as { text: string }).text).toBe('q');
  });

  it('ignores duplicate of an unknown id', () => {
    store.setBlocks([{ id: 'a', type: 'divider', style: 'line' }]);
    store.duplicate('nope');
    expect(store.blocks().length).toBe(1);
  });
});
