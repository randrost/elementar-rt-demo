import { Injectable, signal } from '@angular/core';
import { daysAgo } from '../../shared/mock/mock';

export type FileKind = 'folder' | 'image' | 'document' | 'spreadsheet' | 'pdf' | 'archive' | 'code' | 'video' | 'audio';

export interface FileNode {
  id: string;
  name: string;
  kind: FileKind;
  /** Bytes. Folders report the sum of their contents. */
  size: number;
  modified: string;
  ownerSeed: string;
  /** Parent folder id; null at the root. */
  parentId: string | null;
  starred: boolean;
}

export const KIND_META: Record<FileKind, { icon: string; classes: string }> = {
  folder: { icon: 'solar:folder-bold-duotone', classes: 'text-amber-500' },
  image: { icon: 'solar:gallery-bold-duotone', classes: 'text-pink-500' },
  document: { icon: 'solar:document-text-bold-duotone', classes: 'text-sky-500' },
  spreadsheet: { icon: 'solar:chart-square-bold-duotone', classes: 'text-green-500' },
  pdf: { icon: 'solar:file-text-bold-duotone', classes: 'text-red-500' },
  archive: { icon: 'solar:archive-bold-duotone', classes: 'text-violet-500' },
  code: { icon: 'solar:code-square-bold-duotone', classes: 'text-indigo-500' },
  video: { icon: 'solar:videocamera-record-bold-duotone', classes: 'text-orange-500' },
  audio: { icon: 'solar:music-note-2-bold-duotone', classes: 'text-teal-500' }
};

const KB = 1024;
const MB = KB * 1024;

export function formatBytes(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  if (bytes >= KB) return `${Math.round(bytes / KB)} KB`;
  return `${bytes} B`;
}

let seq = 0;
function node(
  name: string,
  kind: FileKind,
  size: number,
  parentId: string | null,
  ownerSeed: string,
  daysOld: number,
  starred = false
): FileNode {
  seq += 1;
  return { id: `node-${seq}`, name, kind, size, modified: daysAgo(daysOld), ownerSeed, parentId, starred };
}

/* Root folders get stable ids so the seeded children can point at them. */
const ROOT_FOLDERS = {
  design: 'node-1',
  engineering: 'node-2',
  marketing: 'node-3',
  finance: 'node-4'
};

const SEED: FileNode[] = [
  node('Design', 'folder', 0, null, 'hedy-lamarr', 2, true),
  node('Engineering', 'folder', 0, null, 'margaret-hamilton', 1),
  node('Marketing', 'folder', 0, null, 'anita-borg', 5),
  node('Finance', 'folder', 0, null, 'marie-curie', 8),
  node('Brand guidelines.pdf', 'pdf', 4.2 * MB, null, 'hedy-lamarr', 12, true),
  node('Q3 roadmap.xlsx', 'spreadsheet', 820 * KB, null, 'ada-lovelace', 3),
  node('Team offsite.mp4', 'video', 184 * MB, null, 'anita-borg', 20),

  // Design
  node('Component specs', 'folder', 0, ROOT_FOLDERS.design, 'hedy-lamarr', 4),
  node('Dashboard mockup.png', 'image', 2.8 * MB, ROOT_FOLDERS.design, 'hedy-lamarr', 2, true),
  node('Icon set.zip', 'archive', 11.4 * MB, ROOT_FOLDERS.design, 'alan-kay', 9),
  node('Colour tokens.pdf', 'pdf', 1.1 * MB, ROOT_FOLDERS.design, 'hedy-lamarr', 6),
  node('Empty states.png', 'image', 1.9 * MB, ROOT_FOLDERS.design, 'alan-kay', 11),

  // Design › Component specs
  node('Datatable spec.docx', 'document', 340 * KB, 'node-8', 'hedy-lamarr', 4),
  node('Charts spec.docx', 'document', 296 * KB, 'node-8', 'alan-kay', 7),

  // Engineering
  node('Release notes.md', 'code', 18 * KB, ROOT_FOLDERS.engineering, 'margaret-hamilton', 1),
  node('api-schema.json', 'code', 64 * KB, ROOT_FOLDERS.engineering, 'barbara-liskov', 3),
  node('Perf audit.pdf', 'pdf', 2.3 * MB, ROOT_FOLDERS.engineering, 'frances-allen', 10),
  node('Migration plan.xlsx', 'spreadsheet', 512 * KB, ROOT_FOLDERS.engineering, 'grace-hopper', 14),

  // Marketing
  node('Launch copy.docx', 'document', 128 * KB, ROOT_FOLDERS.marketing, 'anita-borg', 5),
  node('Campaign assets.zip', 'archive', 46 * MB, ROOT_FOLDERS.marketing, 'anita-borg', 16),
  node('Podcast intro.mp3', 'audio', 8.7 * MB, ROOT_FOLDERS.marketing, 'vint-cerf', 22),

  // Finance
  node('Invoices 2026.xlsx', 'spreadsheet', 1.4 * MB, ROOT_FOLDERS.finance, 'marie-curie', 8),
  node('Tax summary.pdf', 'pdf', 680 * KB, ROOT_FOLDERS.finance, 'marie-curie', 18)
];

@Injectable({ providedIn: 'root' })
export class FileManagerService {
  private readonly nodes = signal<FileNode[]>(SEED);
  readonly all = this.nodes.asReadonly();

  childrenOf(parentId: string | null): FileNode[] {
    // Folders first, then files, each alphabetical.
    return this.nodes()
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => {
        if (a.kind === 'folder' && b.kind !== 'folder') return -1;
        if (a.kind !== 'folder' && b.kind === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
  }

  byId(id: string): FileNode | undefined {
    return this.nodes().find((node) => node.id === id);
  }

  /** Root → … → folder, for the breadcrumb. */
  pathTo(id: string | null): FileNode[] {
    const path: FileNode[] = [];
    let current = id ? this.byId(id) : undefined;
    while (current) {
      path.unshift(current);
      current = current.parentId ? this.byId(current.parentId) : undefined;
    }
    return path;
  }

  /** Folder sizes are derived, so they stay right as children change. */
  sizeOf(node: FileNode): number {
    if (node.kind !== 'folder') return node.size;
    return this.childrenOf(node.id).reduce((sum, child) => sum + this.sizeOf(child), 0);
  }

  toggleStar(id: string): void {
    this.nodes.update((list) =>
      list.map((node) => (node.id === id ? { ...node, starred: !node.starred } : node))
    );
  }

  remove(ids: readonly string[]): void {
    const doomed = new Set(ids);
    // Removing a folder removes everything beneath it.
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of this.nodes()) {
        if (node.parentId && doomed.has(node.parentId) && !doomed.has(node.id)) {
          doomed.add(node.id);
          changed = true;
        }
      }
    }
    this.nodes.update((list) => list.filter((node) => !doomed.has(node.id)));
  }

  upload(name: string, parentId: string | null, size: number): void {
    const kind = kindFromName(name);
    seq += 1;
    this.nodes.update((list) => [
      ...list,
      {
        id: `node-${seq}`,
        name,
        kind,
        size,
        modified: new Date().toISOString(),
        ownerSeed: 'rostyslav-tulika',
        parentId,
        starred: false
      }
    ]);
  }
}

export function kindFromName(name: string): FileKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'spreadsheet';
  if (['zip', 'tar', 'gz', 'rar'].includes(ext)) return 'archive';
  if (['ts', 'js', 'json', 'md', 'html', 'css'].includes(ext)) return 'code';
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'flac'].includes(ext)) return 'audio';
  return 'document';
}
