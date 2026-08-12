import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell';
import { PlaceholderComponent } from './shared/placeholder/placeholder';

/** Placeholder leaf route; replaced by real feature components phase by phase. */
function leaf(path: string, title: string): Routes[number] {
  return { path, component: PlaceholderComponent, data: { title }, title: `${title} · Elementar RT` };
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard/getting-started' },

  // ---- Outside shell ----
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes)
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.routes').then((m) => m.errorRoutes)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding').then((m) => m.OnboardingComponent),
    title: 'Get Started · Elementar RT'
  },

  // ---- Inside shell ----
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboards/dashboards.routes').then((m) => m.dashboardRoutes)
      },
      {
        path: 'applications',
        children: [
          leaf('calendar', 'Calendar'),
          leaf('messenger', 'Messenger'),
          leaf('file-manager', 'File Manager'),
          leaf('content-editor', 'Content Editor'),
          leaf('kanban', 'Kanban'),
          leaf('notes', 'Notes'),
          leaf('contacts', 'Contacts'),
          leaf('ai-studio', 'AI Studio'),
          {
            path: 'help-center',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'home' },
              leaf('home', 'Help Center'),
              leaf('faq', 'FAQ'),
              leaf('guides', 'Guides'),
              leaf('support', 'Support')
            ]
          },
          {
            path: 'invoice',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'list' },
              leaf('list', 'Invoices'),
              leaf('details/:id', 'Invoice Details'),
              leaf('new', 'New Invoice'),
              leaf('edit/:id', 'Edit Invoice')
            ]
          },
          {
            path: 'email',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'inbox' },
              leaf('inbox', 'Inbox'),
              leaf('sent', 'Sent'),
              leaf('drafts', 'Drafts'),
              leaf('spam', 'Spam'),
              leaf('trash', 'Trash'),
              leaf('label/:label', 'Label')
            ]
          },
          leaf('projects', 'Projects'),
          {
            path: 'courses',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'list' },
              leaf('list', 'Courses'),
              leaf('details/:id', 'Course Details'),
              leaf('builder/:id', 'Course Builder')
            ]
          }
        ]
      },
      {
        path: 'management',
        children: [
          {
            path: 'posts',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'list' },
              leaf('list', 'All Posts'),
              leaf('new', 'New Post'),
              leaf('details/:id', 'Post Details'),
              leaf('edit/:id', 'Edit Post'),
              leaf('categories', 'Categories'),
              leaf('topics', 'Topics')
            ]
          },
          {
            path: 'settings',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'general' },
              leaf('general', 'General Settings'),
              leaf('writing', 'Writing Settings'),
              leaf('reading', 'Reading Settings'),
              leaf('discussion', 'Discussion Settings'),
              leaf('media', 'Media Settings')
            ]
          }
        ]
      },
      {
        path: 'account',
        children: [
          leaf('notifications', 'Notifications'),
          {
            path: 'settings',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'my-profile' },
              leaf('my-profile', 'My Profile'),
              leaf('security', 'Security'),
              leaf('notifications', 'Notification Settings'),
              leaf('notifications-2', 'Notification Settings'),
              leaf('billing', 'Billing'),
              leaf('billing-2', 'Billing'),
              leaf('sessions', 'Sessions'),
              leaf('cookie', 'Cookies'),
              leaf('payment', 'Payment')
            ]
          }
        ]
      },
      {
        path: 'user-profile',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          leaf('overview', 'Profile Overview'),
          leaf('talent', 'Talent Profile')
        ]
      },
      {
        path: 'widgets',
        loadChildren: () => import('./widgets/widgets.routes').then((m) => m.widgetsRoutes)
      },
      {
        path: 'cards',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'general' },
          leaf('general', 'General Cards'),
          leaf('users', 'User Cards')
        ]
      },
      {
        path: 'prebuilt',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'skeleton' },
          leaf('skeleton', 'Skeletons'),
          leaf('notifications', 'Notifications'),
          leaf('selects', 'Selects'),
          leaf('dialogs', 'Dialogs')
        ]
      },
      {
        path: 'datatables',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'general' },
          leaf('general', 'Data Tables'),
          leaf('users', 'Users Table')
        ]
      },
      leaf('themes', 'Themes'),
      {
        path: 'pricing',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'basic' },
          leaf('basic', 'Pricing'),
          leaf('membership', 'Membership Plans')
        ]
      },
      leaf('integrations', 'Integrations'),
      {
        path: 'service-pages',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'email-activation' },
          leaf('email-activation', 'Email Activation'),
          leaf('integrations', 'Integrations Status')
        ]
      },
      {
        path: 'content',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'posts' },
          leaf('posts', 'Posts')
        ]
      },
      // Temporary: shared-kit verification page (removed in the hardening phase).
      { path: 'dev-kit', loadComponent: () => import('./shared/dev-kit/dev-kit').then((m) => m.DevKitComponent), title: 'Dev Kit · Elementar RT' }
    ]
  },

  { path: '**', redirectTo: 'error/not-found' }
];
