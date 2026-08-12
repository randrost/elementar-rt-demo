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
          {
            path: 'calendar',
            loadComponent: () => import('./applications/calendar/calendar').then((m) => m.CalendarComponent),
            data: { title: 'Calendar' },
            title: 'Calendar · Elementar RT'
          },
          {
            path: 'messenger',
            loadComponent: () => import('./applications/messenger/messenger').then((m) => m.MessengerComponent),
            data: { title: 'Messenger' },
            title: 'Messenger · Elementar RT'
          },
          {
            path: 'file-manager',
            loadComponent: () =>
              import('./applications/file-manager/file-manager').then((m) => m.FileManagerComponent),
            data: { title: 'File Manager' },
            title: 'File Manager · Elementar RT'
          },
          {
            path: 'content-editor',
            loadComponent: () =>
              import('./applications/content-editor/content-editor').then((m) => m.ContentEditorComponent),
            data: { title: 'Content Editor' },
            title: 'Content Editor · Elementar RT'
          },
          {
            path: 'kanban',
            loadComponent: () => import('./applications/kanban/kanban').then((m) => m.KanbanComponent),
            data: { title: 'Kanban' },
            title: 'Kanban · Elementar RT'
          },
          {
            path: 'notes',
            loadComponent: () => import('./applications/notes/notes').then((m) => m.NotesComponent),
            data: { title: 'Notes' },
            title: 'Notes · Elementar RT'
          },
          {
            path: 'contacts',
            loadComponent: () => import('./applications/contacts/contacts').then((m) => m.ContactsComponent),
            data: { title: 'Contacts' },
            title: 'Contacts · Elementar RT'
          },
          leaf('ai-studio', 'AI Studio'),
          {
            path: 'help-center',
            loadChildren: () =>
              import('./applications/help-center/help-center.routes').then((m) => m.helpCenterRoutes)
          },
          {
            path: 'invoice',
            loadChildren: () => import('./applications/invoice/invoice.routes').then((m) => m.invoiceRoutes)
          },
          {
            path: 'email',
            loadChildren: () => import('./applications/email/email.routes').then((m) => m.emailRoutes)
          },
          {
            path: 'projects',
            loadComponent: () => import('./applications/projects/projects').then((m) => m.ProjectsComponent),
            data: { title: 'Projects' },
            title: 'Projects · Elementar RT'
          },
          {
            path: 'courses',
            loadChildren: () => import('./applications/courses/courses.routes').then((m) => m.coursesRoutes)
          }
        ]
      },
      {
        path: 'management',
        loadChildren: () => import('./management/management.routes').then((m) => m.managementRoutes)
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.routes').then((m) => m.accountRoutes)
      },
      {
        path: 'user-profile',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          {
            path: 'overview',
            loadComponent: () => import('./user-profile/profile').then((m) => m.UserProfileComponent),
            data: { title: 'Profile Overview', variant: 'overview' },
            title: 'Profile · Elementar RT'
          },
          {
            path: 'talent',
            loadComponent: () => import('./user-profile/profile').then((m) => m.UserProfileComponent),
            data: { title: 'Talent Profile', variant: 'talent' },
            title: 'Talent Profile · Elementar RT'
          }
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
