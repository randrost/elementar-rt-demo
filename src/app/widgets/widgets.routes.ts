import { Routes } from '@angular/router';
import { WidgetGalleryComponent } from './gallery/widget-gallery';

export const widgetsRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'general' },
  {
    path: 'general',
    component: WidgetGalleryComponent,
    data: { title: 'General Widgets', group: 'general' },
    title: 'General Widgets · Elementar RT'
  },
  {
    path: 'crypto',
    component: WidgetGalleryComponent,
    data: { title: 'Crypto Widgets', group: 'crypto' },
    title: 'Crypto Widgets · Elementar RT'
  },
  {
    path: 'finance',
    component: WidgetGalleryComponent,
    data: { title: 'Finance Widgets', group: 'finance' },
    title: 'Finance Widgets · Elementar RT'
  },
  {
    path: 'analytics',
    component: WidgetGalleryComponent,
    data: { title: 'Analytics Widgets', group: 'analytics' },
    title: 'Analytics Widgets · Elementar RT'
  }
];
