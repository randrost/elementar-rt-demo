/** Declarative sidebar navigation model. */

export interface NavLink {
  label: string;
  link: string;
  icon?: string;
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  icon: string;
  children: NavLink[];
}

export interface NavSection {
  heading: string;
  items: (NavLink | NavGroup)[];
}

export function isGroup(item: NavLink | NavGroup): item is NavGroup {
  return 'children' in item;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'Dashboards',
    items: [
      { label: 'Getting Started', link: '/dashboard/getting-started', icon: 'solar:rocket-2-bold-duotone' },
      {
        label: 'Dashboards',
        icon: 'solar:widget-5-bold-duotone',
        children: [
          { label: 'Basic', link: '/dashboard/basic' },
          { label: 'Analytics', link: '/dashboard/analytics' },
          { label: 'eCommerce', link: '/dashboard/ecommerce' },
          { label: 'Finance', link: '/dashboard/finance' },
          { label: 'Explore', link: '/dashboard/explore' },
          { label: 'Dynamic', link: '/dashboard/dynamic' }
        ]
      }
    ]
  },
  {
    heading: 'Applications',
    items: [
      { label: 'Calendar', link: '/applications/calendar', icon: 'solar:calendar-bold-duotone' },
      { label: 'Messenger', link: '/applications/messenger', icon: 'solar:chat-round-dots-bold-duotone' },
      { label: 'Email', link: '/applications/email/inbox', icon: 'solar:letter-bold-duotone' },
      { label: 'File Manager', link: '/applications/file-manager', icon: 'solar:folder-with-files-bold-duotone' },
      { label: 'Kanban', link: '/applications/kanban', icon: 'solar:notebook-bold-duotone' },
      { label: 'Notes', link: '/applications/notes', icon: 'solar:notes-bold-duotone' },
      { label: 'Contacts', link: '/applications/contacts', icon: 'solar:users-group-rounded-bold-duotone' },
      { label: 'Content Editor', link: '/applications/content-editor', icon: 'solar:pen-new-square-bold-duotone' },
      { label: 'AI Studio', link: '/applications/ai-studio', icon: 'solar:magic-stick-3-bold-duotone', badge: 'AI' },
      { label: 'Invoice', link: '/applications/invoice/list', icon: 'solar:bill-list-bold-duotone' },
      { label: 'Projects', link: '/applications/projects', icon: 'solar:folder-bold-duotone' },
      { label: 'Courses', link: '/applications/courses/list', icon: 'solar:square-academic-cap-bold-duotone' },
      {
        label: 'Help Center',
        icon: 'solar:question-circle-bold-duotone',
        children: [
          { label: 'Home', link: '/applications/help-center/home' },
          { label: 'FAQ', link: '/applications/help-center/faq' },
          { label: 'Guides', link: '/applications/help-center/guides' },
          { label: 'Support', link: '/applications/help-center/support' }
        ]
      }
    ]
  },
  {
    heading: 'Management',
    items: [
      {
        label: 'Posts',
        icon: 'solar:document-text-bold-duotone',
        children: [
          { label: 'All Posts', link: '/management/posts/list' },
          { label: 'New Post', link: '/management/posts/new' },
          { label: 'Categories', link: '/management/posts/categories' },
          { label: 'Topics', link: '/management/posts/topics' }
        ]
      },
      {
        label: 'Site Settings',
        icon: 'solar:settings-bold-duotone',
        children: [
          { label: 'General', link: '/management/settings/general' },
          { label: 'Writing', link: '/management/settings/writing' },
          { label: 'Reading', link: '/management/settings/reading' },
          { label: 'Discussion', link: '/management/settings/discussion' },
          { label: 'Media', link: '/management/settings/media' }
        ]
      }
    ]
  },
  {
    heading: 'Account',
    items: [
      { label: 'Notifications', link: '/account/notifications', icon: 'solar:bell-bold-duotone' },
      {
        label: 'Settings',
        icon: 'solar:user-circle-bold-duotone',
        children: [
          { label: 'My Profile', link: '/account/settings/my-profile' },
          { label: 'Security', link: '/account/settings/security' },
          { label: 'Notifications', link: '/account/settings/notifications' },
          { label: 'Billing', link: '/account/settings/billing' },
          { label: 'Sessions', link: '/account/settings/sessions' },
          { label: 'Cookies', link: '/account/settings/cookie' },
          { label: 'Payment', link: '/account/settings/payment' }
        ]
      },
      {
        label: 'Profile',
        icon: 'solar:user-id-bold-duotone',
        children: [
          { label: 'Overview', link: '/user-profile/overview' },
          { label: 'Talent', link: '/user-profile/talent' }
        ]
      }
    ]
  },
  {
    heading: 'UI Gallery',
    items: [
      {
        label: 'Widgets',
        icon: 'solar:pie-chart-2-bold-duotone',
        children: [
          { label: 'General', link: '/widgets/general' },
          { label: 'Crypto', link: '/widgets/crypto' },
          { label: 'Finance', link: '/widgets/finance' },
          { label: 'Analytics', link: '/widgets/analytics' }
        ]
      },
      {
        label: 'Cards',
        icon: 'solar:card-bold-duotone',
        children: [
          { label: 'General', link: '/cards/general' },
          { label: 'Users', link: '/cards/users' }
        ]
      },
      {
        label: 'Prebuilt',
        icon: 'solar:widget-4-bold-duotone',
        children: [
          { label: 'Skeleton', link: '/prebuilt/skeleton' },
          { label: 'Notifications', link: '/prebuilt/notifications' },
          { label: 'Selects', link: '/prebuilt/selects' },
          { label: 'Dialogs', link: '/prebuilt/dialogs' }
        ]
      },
      {
        label: 'Data Tables',
        icon: 'solar:tablet-bold-duotone',
        children: [
          { label: 'General', link: '/datatables/general' },
          { label: 'Users', link: '/datatables/users' }
        ]
      },
      { label: 'Themes', link: '/themes', icon: 'solar:pallete-2-bold-duotone' },
      {
        label: 'Pricing',
        icon: 'solar:tag-price-bold-duotone',
        children: [
          { label: 'Basic', link: '/pricing/basic' },
          { label: 'Membership', link: '/pricing/membership' }
        ]
      },
      { label: 'Integrations', link: '/integrations', icon: 'solar:plug-circle-bold-duotone' }
    ]
  }
];
