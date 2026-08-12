import { Injectable, signal } from '@angular/core';

export type SettingsArea = 'general' | 'writing' | 'reading' | 'discussion' | 'media';
export type FieldType = 'text' | 'textarea' | 'number' | 'toggle' | 'select';

export interface SettingField {
  key: string;
  label: string;
  hint?: string;
  type: FieldType;
  options?: string[];
}

export interface SettingGroup {
  title: string;
  description?: string;
  fields: SettingField[];
}

export interface SettingsAreaMeta {
  title: string;
  description: string;
  groups: SettingGroup[];
}

export const SETTINGS_GROUPS: Record<SettingsArea, SettingsAreaMeta> = {
  general: {
    title: 'General settings',
    description: 'Identity, locale, and how the workspace addresses people.',
    groups: [
      {
        title: 'Identity',
        description: 'Shown in the browser tab, emails, and anywhere the workspace names itself.',
        fields: [
          { key: 'siteTitle', label: 'Workspace name', type: 'text' },
          { key: 'tagline', label: 'Tagline', hint: 'A short line under the name.', type: 'text' },
          { key: 'siteUrl', label: 'Workspace URL', type: 'text' },
          { key: 'adminEmail', label: 'Admin email', hint: 'Where system notices go.', type: 'text' }
        ]
      },
      {
        title: 'Locale',
        fields: [
          { key: 'language', label: 'Language', type: 'select', options: ['English (UK)', 'English (US)', 'Deutsch', '日本語'] },
          { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'Asia/Tokyo'] },
          { key: 'dateFormat', label: 'Date format', type: 'select', options: ['D MMMM YYYY', 'MMMM D, YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
          { key: 'weekStart', label: 'Week starts on', type: 'select', options: ['Monday', 'Sunday'] }
        ]
      },
      {
        title: 'Membership',
        fields: [
          { key: 'openRegistration', label: 'Anyone can register', hint: 'Off means invite only.', type: 'toggle' },
          { key: 'defaultRole', label: 'Default role', type: 'select', options: ['Member', 'Editor', 'Admin'] }
        ]
      }
    ]
  },
  writing: {
    title: 'Writing settings',
    description: 'Defaults applied when someone starts a new post.',
    groups: [
      {
        title: 'Defaults',
        fields: [
          { key: 'defaultCategory', label: 'Default category', type: 'select', options: ['Design', 'Engineering', 'Product', 'Company'] },
          { key: 'defaultStatus', label: 'Default status', type: 'select', options: ['Draft', 'Scheduled', 'Published'] },
          { key: 'defaultFormat', label: 'Default format', type: 'select', options: ['Standard', 'Aside', 'Gallery', 'Link'] }
        ]
      },
      {
        title: 'Editor',
        fields: [
          { key: 'autosave', label: 'Autosave drafts', hint: 'Every 60 seconds while typing.', type: 'toggle' },
          { key: 'revisions', label: 'Keep revisions', type: 'toggle' },
          { key: 'revisionLimit', label: 'Revisions to keep', type: 'number' },
          { key: 'markdownShortcuts', label: 'Markdown shortcuts', hint: 'Typing ## becomes a heading.', type: 'toggle' }
        ]
      },
      {
        title: 'Publishing by email',
        fields: [
          { key: 'mailServer', label: 'Mail server', type: 'text' },
          { key: 'mailPort', label: 'Port', type: 'number' }
        ]
      }
    ]
  },
  reading: {
    title: 'Reading settings',
    description: 'What visitors see, and how much of it.',
    groups: [
      {
        title: 'Front page',
        fields: [
          { key: 'homepageShows', label: 'Homepage shows', type: 'select', options: ['Latest posts', 'A static page'] },
          { key: 'postsPerPage', label: 'Posts per page', type: 'number' },
          { key: 'feedItems', label: 'Items in feed', type: 'number' }
        ]
      },
      {
        title: 'Content',
        fields: [
          { key: 'feedShows', label: 'Feed shows', type: 'select', options: ['Full text', 'Excerpt'] },
          { key: 'showReadingTime', label: 'Show reading time', type: 'toggle' },
          { key: 'showAuthor', label: 'Show author byline', type: 'toggle' }
        ]
      },
      {
        title: 'Visibility',
        fields: [
          { key: 'discourageSearch', label: 'Discourage search engines', hint: 'Honoured by well-behaved crawlers only.', type: 'toggle' }
        ]
      }
    ]
  },
  discussion: {
    title: 'Discussion settings',
    description: 'Comments, moderation, and what triggers a notification.',
    groups: [
      {
        title: 'Defaults',
        fields: [
          { key: 'allowComments', label: 'Allow comments on new posts', type: 'toggle' },
          { key: 'requireName', label: 'Require name and email', type: 'toggle' },
          { key: 'requireAccount', label: 'Commenters must be signed in', type: 'toggle' },
          { key: 'closeAfterDays', label: 'Close comments after (days)', type: 'number' }
        ]
      },
      {
        title: 'Moderation',
        fields: [
          { key: 'holdForApproval', label: 'Hold all comments for approval', type: 'toggle' },
          { key: 'linkThreshold', label: 'Hold if links exceed', type: 'number' },
          { key: 'blocklist', label: 'Blocklist', hint: 'One term per line. Matching comments go to spam.', type: 'textarea' }
        ]
      },
      {
        title: 'Email me when',
        fields: [
          { key: 'emailOnComment', label: 'Anyone comments', type: 'toggle' },
          { key: 'emailOnModeration', label: 'A comment is held for moderation', type: 'toggle' }
        ]
      }
    ]
  },
  media: {
    title: 'Media settings',
    description: 'Upload limits and the sizes generated for each image.',
    groups: [
      {
        title: 'Image sizes',
        description: 'Generated on upload. Changing these does not touch existing files.',
        fields: [
          { key: 'thumbWidth', label: 'Thumbnail width', type: 'number' },
          { key: 'thumbHeight', label: 'Thumbnail height', type: 'number' },
          { key: 'mediumWidth', label: 'Medium max width', type: 'number' },
          { key: 'largeWidth', label: 'Large max width', type: 'number' }
        ]
      },
      {
        title: 'Uploads',
        fields: [
          { key: 'organiseByDate', label: 'Organise into month folders', type: 'toggle' },
          { key: 'maxUploadMb', label: 'Max upload size (MB)', type: 'number' },
          { key: 'allowedTypes', label: 'Allowed types', hint: 'Comma separated extensions.', type: 'text' },
          { key: 'convertWebp', label: 'Convert to WebP', hint: 'Keeps the original as a fallback.', type: 'toggle' }
        ]
      }
    ]
  }
};

const DEFAULTS: Record<string, string | boolean> = {
  siteTitle: 'Elementar RT',
  tagline: 'Admin experiences, faster',
  siteUrl: 'https://elementar-rt.dev',
  adminEmail: 'admin@elementar-rt.dev',
  language: 'English (UK)',
  timezone: 'Europe/London',
  dateFormat: 'D MMMM YYYY',
  weekStart: 'Monday',
  openRegistration: false,
  defaultRole: 'Member',

  defaultCategory: 'Design',
  defaultStatus: 'Draft',
  defaultFormat: 'Standard',
  autosave: true,
  revisions: true,
  revisionLimit: '25',
  markdownShortcuts: true,
  mailServer: 'mail.elementar-rt.dev',
  mailPort: '587',

  homepageShows: 'Latest posts',
  postsPerPage: '10',
  feedItems: '20',
  feedShows: 'Excerpt',
  showReadingTime: true,
  showAuthor: true,
  discourageSearch: false,

  allowComments: true,
  requireName: true,
  requireAccount: false,
  closeAfterDays: '90',
  holdForApproval: false,
  linkThreshold: '2',
  blocklist: '',
  emailOnComment: true,
  emailOnModeration: true,

  thumbWidth: '150',
  thumbHeight: '150',
  mediumWidth: '800',
  largeWidth: '1600',
  organiseByDate: true,
  maxUploadMb: '25',
  allowedTypes: 'jpg, png, webp, svg, pdf',
  convertWebp: true
};

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private readonly state = signal<Record<string, string | boolean>>({ ...DEFAULTS });
  readonly values = this.state.asReadonly();

  merge(changes: Record<string, string | boolean>): void {
    this.state.update((current) => ({ ...current, ...changes }));
  }
}
