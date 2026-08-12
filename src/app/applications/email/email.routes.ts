import { Routes } from '@angular/router';
import { EmailComponent } from './email';

/** One component serves every folder; the folder itself comes from route data. */
export const emailRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inbox' },
  { path: 'inbox', component: EmailComponent, data: { title: 'Inbox', folder: 'inbox' }, title: 'Inbox · Elementar RT' },
  { path: 'sent', component: EmailComponent, data: { title: 'Sent', folder: 'sent' }, title: 'Sent · Elementar RT' },
  { path: 'drafts', component: EmailComponent, data: { title: 'Drafts', folder: 'drafts' }, title: 'Drafts · Elementar RT' },
  { path: 'spam', component: EmailComponent, data: { title: 'Spam', folder: 'spam' }, title: 'Spam · Elementar RT' },
  { path: 'trash', component: EmailComponent, data: { title: 'Trash', folder: 'trash' }, title: 'Trash · Elementar RT' },
  {
    path: 'label/:label',
    component: EmailComponent,
    data: { title: 'Label', folder: 'inbox' },
    title: 'Label · Elementar RT'
  }
];
