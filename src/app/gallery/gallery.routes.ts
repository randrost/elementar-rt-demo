import { Routes } from '@angular/router';
import { GalleryCardsComponent } from './cards';
import { GalleryDatatablesComponent } from './datatables';
import { GalleryPricingComponent } from './pricing';
import { GalleryServicePagesComponent } from './service-pages';
import { ContentPostsComponent } from './content-posts';
import { GallerySkeletonComponent } from './prebuilt/skeleton';
import { GalleryNotificationsComponent } from './prebuilt/notifications';
import { GallerySelectsComponent } from './prebuilt/selects';
import { GalleryDialogsComponent } from './prebuilt/dialogs';

export const cardsRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'general' },
  {
    path: 'general',
    component: GalleryCardsComponent,
    data: { title: 'General Cards', variant: 'general' },
    title: 'Cards · Elementar RT'
  },
  {
    path: 'users',
    component: GalleryCardsComponent,
    data: { title: 'User Cards', variant: 'users' },
    title: 'User Cards · Elementar RT'
  }
];

export const datatableRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'general' },
  {
    path: 'general',
    component: GalleryDatatablesComponent,
    data: { title: 'Data Tables', variant: 'general' },
    title: 'Data Tables · Elementar RT'
  },
  {
    path: 'users',
    component: GalleryDatatablesComponent,
    data: { title: 'Users Table', variant: 'users' },
    title: 'Users Table · Elementar RT'
  }
];

export const prebuiltRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'skeleton' },
  { path: 'skeleton', component: GallerySkeletonComponent, data: { title: 'Skeletons' }, title: 'Skeletons · Elementar RT' },
  {
    path: 'notifications',
    component: GalleryNotificationsComponent,
    data: { title: 'Notifications' },
    title: 'Notifications · Elementar RT'
  },
  { path: 'selects', component: GallerySelectsComponent, data: { title: 'Selects' }, title: 'Selects · Elementar RT' },
  { path: 'dialogs', component: GalleryDialogsComponent, data: { title: 'Dialogs' }, title: 'Dialogs · Elementar RT' }
];

export const pricingRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'basic' },
  {
    path: 'basic',
    component: GalleryPricingComponent,
    data: { title: 'Pricing', variant: 'basic' },
    title: 'Pricing · Elementar RT'
  },
  {
    path: 'membership',
    component: GalleryPricingComponent,
    data: { title: 'Membership Plans', variant: 'membership' },
    title: 'Membership · Elementar RT'
  }
];

export const servicePagesRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'email-activation' },
  {
    path: 'email-activation',
    component: GalleryServicePagesComponent,
    data: { title: 'Email Activation', variant: 'email-activation' },
    title: 'Email Activation · Elementar RT'
  },
  {
    path: 'integrations',
    component: GalleryServicePagesComponent,
    data: { title: 'Integrations Status', variant: 'integrations' },
    title: 'Integration Status · Elementar RT'
  }
];

export const contentRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'posts' },
  { path: 'posts', component: ContentPostsComponent, data: { title: 'Posts' }, title: 'Posts · Elementar RT' }
];
