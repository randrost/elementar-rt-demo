import { Routes } from '@angular/router';
import { PostListComponent } from './posts/post-list';
import { PostDetailsComponent } from './posts/post-details';
import { PostFormComponent } from './posts/post-form';
import { TaxonomyPageComponent } from './posts/taxonomy-page';
import { SiteSettingsComponent } from './settings/settings-page';

const settings = (path: string, area: string, title: string) => ({
  path,
  component: SiteSettingsComponent,
  data: { title, area },
  title: `${title} · Elementar RT`
});

export const managementRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'posts' },
  {
    path: 'posts',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      { path: 'list', component: PostListComponent, data: { title: 'All Posts' }, title: 'All Posts · Elementar RT' },
      { path: 'new', component: PostFormComponent, data: { title: 'New Post' }, title: 'New Post · Elementar RT' },
      {
        path: 'details/:id',
        component: PostDetailsComponent,
        data: { title: 'Post Details' },
        title: 'Post · Elementar RT'
      },
      {
        path: 'edit/:id',
        component: PostFormComponent,
        data: { title: 'Edit Post' },
        title: 'Edit Post · Elementar RT'
      },
      {
        path: 'categories',
        component: TaxonomyPageComponent,
        data: { title: 'Categories', kind: 'categories' },
        title: 'Categories · Elementar RT'
      },
      {
        path: 'topics',
        component: TaxonomyPageComponent,
        data: { title: 'Topics', kind: 'topics' },
        title: 'Topics · Elementar RT'
      }
    ]
  },
  {
    path: 'settings',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'general' },
      settings('general', 'general', 'General Settings'),
      settings('writing', 'writing', 'Writing Settings'),
      settings('reading', 'reading', 'Reading Settings'),
      settings('discussion', 'discussion', 'Discussion Settings'),
      settings('media', 'media', 'Media Settings')
    ]
  }
];
