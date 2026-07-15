import { Injectable } from '@angular/core';
import { createAvatar } from '@dicebear/core';
import { glass, initials, notionists } from '@dicebear/collection';

/**
 * Generates deterministic avatar data URIs from a seed string using DiceBear.
 * Used across the shell (user menu), contacts, projects, email, etc.
 */
@Injectable({ providedIn: 'root' })
export class AvatarService {
  private readonly cache = new Map<string, string>();

  /** A colorful "person" avatar for users. */
  person(seed: string): string {
    return this.build(`p:${seed}`, () =>
      createAvatar(notionists, { seed, radius: 50, backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'] }).toDataUri()
    );
  }

  /** A soft "glass" gradient avatar, good for brands/projects. */
  brand(seed: string): string {
    return this.build(`b:${seed}`, () => createAvatar(glass, { seed, radius: 50 }).toDataUri());
  }

  /** Initials avatar fallback. */
  initials(seed: string): string {
    return this.build(`i:${seed}`, () => createAvatar(initials, { seed, radius: 50 }).toDataUri());
  }

  private build(key: string, make: () => string): string {
    let uri = this.cache.get(key);
    if (!uri) {
      uri = make();
      this.cache.set(key, uri);
    }
    return uri;
  }
}
