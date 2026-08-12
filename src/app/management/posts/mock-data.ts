import { Injectable, computed, signal } from '@angular/core';
import { daysAgo, randomId } from '../../shared/mock/mock';
import { StatusTone } from '../../shared/datatable/datatable.types';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Markdown — the editor round-trips this. */
  body: string;
  status: PostStatus;
  category: string;
  topics: string[];
  authorName: string;
  authorSeed: string;
  date: string;
  readMins: number;
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export const POST_STATUS: Record<PostStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  published: { label: 'Published', tone: 'success' },
  archived: { label: 'Archived', tone: 'warning' }
};

const BODY = `## Why the shell matters

Most admin interfaces fail in the same place: they treat every screen as a chance
to show what the system can do, rather than what the person came to do.

- Navigation you stop noticing after a day
- A content area that never fights you for space
- Density that is a **decision**, not a default

> If a setting resolves a disagreement your team has had twice, it has already
> paid for itself.

### What we changed

We moved the density toggle into the header, remembered the choice per user, and
stopped arguing about it in reviews.
`;

const SEED: readonly Omit<Post, 'id' | 'date'>[] = [
  { title: 'Designing an admin shell that gets out of the way', slug: 'admin-shell', excerpt: 'Navigation you stop noticing, and a content area that never fights you.', body: BODY, status: 'published', category: 'Design', topics: ['UX', 'Shell'], authorName: 'Ada Lovelace', authorSeed: 'ada-lovelace', readMins: 7 },
  { title: 'Deriving dark mode instead of authoring it', slug: 'deriving-dark-mode', excerpt: 'One token set, two schemes, no second stylesheet to forget.', body: BODY, status: 'published', category: 'Design', topics: ['Theming'], authorName: 'Hedy Lamarr', authorSeed: 'hedy-lamarr', readMins: 9 },
  { title: 'A widget registry as the single source of truth', slug: 'widget-registry', excerpt: 'Galleries, dashboards, and the picker all render from one list.', body: BODY, status: 'published', category: 'Engineering', topics: ['Architecture'], authorName: 'Margaret Hamilton', authorSeed: 'margaret-hamilton', readMins: 11 },
  { title: 'Signals changed how we write components', slug: 'signals-in-anger', excerpt: 'Deriving state instead of synchronising it.', body: BODY, status: 'published', category: 'Engineering', topics: ['Angular'], authorName: 'Barbara Liskov', authorSeed: 'barbara-liskov', readMins: 8 },
  { title: 'What the perf budget actually bought us', slug: 'perf-budget', excerpt: '289kb transferred, and the charts still load lazily.', body: BODY, status: 'scheduled', category: 'Engineering', topics: ['Performance'], authorName: 'Frances Allen', authorSeed: 'frances-allen', readMins: 6 },
  { title: 'Empty states deserve real copy', slug: 'empty-states', excerpt: 'Lorem in a design review derails the conversation every time.', body: BODY, status: 'draft', category: 'Design', topics: ['UX', 'Content'], authorName: 'Alan Kay', authorSeed: 'alan-kay', readMins: 5 },
  { title: 'Accessibility as a build step', slug: 'accessibility-build-step', excerpt: 'Focus rings, contrast, and keyboard paths before the audit.', body: BODY, status: 'published', category: 'Design', topics: ['Accessibility'], authorName: 'Anita Borg', authorSeed: 'anita-borg', readMins: 10 },
  { title: 'Invoicing without surprises', slug: 'invoicing', excerpt: 'Proration, tax, and the maths that must not drift.', body: BODY, status: 'draft', category: 'Product', topics: ['Billing'], authorName: 'Marie Curie', authorSeed: 'marie-curie', readMins: 7 },
  { title: 'Saved views beat custom reports', slug: 'saved-views', excerpt: 'Most "can we get a report for X" requests are a filter set.', body: BODY, status: 'archived', category: 'Product', topics: ['Data'], authorName: 'Grace Hopper', authorSeed: 'grace-hopper', readMins: 6 },
  { title: 'Onboarding: cut nine screens to four', slug: 'onboarding-revamp', excerpt: 'Three of five testers missed the workspace step entirely.', body: BODY, status: 'published', category: 'Product', topics: ['Growth', 'UX'], authorName: 'Tim Berners-Lee', authorSeed: 'tim-berners-lee', readMins: 8 },
  { title: 'Tables people can actually use', slug: 'usable-tables', excerpt: 'Sorting that matches expectations, and finished empty states.', body: BODY, status: 'published', category: 'Design', topics: ['UX', 'Data'], authorName: 'Radia Perlman', authorSeed: 'radia-perlman', readMins: 9 },
  { title: 'Shipping a component library without rot', slug: 'library-rot', excerpt: 'Versioning, docs that stay true, and deprecation that does not break.', body: BODY, status: 'scheduled', category: 'Engineering', topics: ['Architecture'], authorName: 'Sophie Wilson', authorSeed: 'sophie-wilson', readMins: 12 }
];

const CATEGORY_SEED: readonly Omit<Taxonomy, 'count'>[] = [
  { id: 'cat-1', name: 'Design', slug: 'design', description: 'Interface, interaction, and visual language.' },
  { id: 'cat-2', name: 'Engineering', slug: 'engineering', description: 'Architecture, performance, and tooling.' },
  { id: 'cat-3', name: 'Product', slug: 'product', description: 'What we build and why.' },
  { id: 'cat-4', name: 'Company', slug: 'company', description: 'How we work.' }
];

const TOPIC_SEED: readonly Omit<Taxonomy, 'count'>[] = [
  { id: 'top-1', name: 'UX', slug: 'ux', description: 'Usability and interaction detail.' },
  { id: 'top-2', name: 'Theming', slug: 'theming', description: 'Tokens, schemes, and palettes.' },
  { id: 'top-3', name: 'Architecture', slug: 'architecture', description: 'Structure and boundaries.' },
  { id: 'top-4', name: 'Angular', slug: 'angular', description: 'Framework specifics.' },
  { id: 'top-5', name: 'Performance', slug: 'performance', description: 'Budgets and measurement.' },
  { id: 'top-6', name: 'Accessibility', slug: 'accessibility', description: 'Inclusive by default.' },
  { id: 'top-7', name: 'Data', slug: 'data', description: 'Tables, exports, and reporting.' },
  { id: 'top-8', name: 'Growth', slug: 'growth', description: 'Acquisition and activation.' },
  { id: 'top-9', name: 'Billing', slug: 'billing', description: 'Invoices, plans, and tax.' },
  { id: 'top-10', name: 'Shell', slug: 'shell', description: 'Navigation and layout.' },
  { id: 'top-11', name: 'Content', slug: 'content', description: 'Words in the product.' }
];

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly items = signal<Post[]>(
    SEED.map((post, i) => ({ ...post, id: `post-${i + 1}`, date: daysAgo(i * 4 + 1) }))
  );
  private readonly categoryList = signal<Omit<Taxonomy, 'count'>[]>([...CATEGORY_SEED]);
  private readonly topicList = signal<Omit<Taxonomy, 'count'>[]>([...TOPIC_SEED]);

  readonly posts = this.items.asReadonly();

  /** Counts are derived so they never drift from the posts themselves. */
  readonly categories = computed<Taxonomy[]>(() =>
    this.categoryList().map((category) => ({
      ...category,
      count: this.items().filter((post) => post.category === category.name).length
    }))
  );

  readonly topics = computed<Taxonomy[]>(() =>
    this.topicList().map((topic) => ({
      ...topic,
      count: this.items().filter((post) => post.topics.includes(topic.name)).length
    }))
  );

  byId(id: string): Post | undefined {
    return this.items().find((post) => post.id === id);
  }

  draft(): Post {
    return {
      id: randomId('post-'),
      title: '',
      slug: '',
      excerpt: '',
      body: '# New post\n\nStart writing…\n',
      status: 'draft',
      category: 'Design',
      topics: [],
      authorName: 'Rostyslav Tulika',
      authorSeed: 'rostyslav-tulika',
      date: new Date().toISOString(),
      readMins: 1
    };
  }

  save(post: Post): void {
    this.items.update((list) => {
      const index = list.findIndex((item) => item.id === post.id);
      if (index === -1) return [post, ...list];
      const copy = [...list];
      copy[index] = post;
      return copy;
    });
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((post) => post.id !== id));
  }

  addCategory(name: string, description: string): void {
    this.categoryList.update((list) => [
      ...list,
      { id: randomId('cat-'), name, slug: slugify(name), description }
    ]);
  }

  removeCategory(id: string): void {
    this.categoryList.update((list) => list.filter((category) => category.id !== id));
  }

  addTopic(name: string, description: string): void {
    this.topicList.update((list) => [
      ...list,
      { id: randomId('top-'), name, slug: slugify(name), description }
    ]);
  }

  removeTopic(id: string): void {
    this.topicList.update((list) => list.filter((topic) => topic.id !== id));
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
