import { Routes } from '@angular/router';
import { GettingStartedComponent } from './getting-started';
import { BasicDashboardComponent } from './basic';
import { AnalyticsDashboardComponent } from './analytics';
import { EcommerceDashboardComponent } from './ecommerce';
import { FinanceDashboardComponent } from './finance';
import { ExploreDashboardComponent } from './explore';

export const dashboardRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'getting-started' },
  {
    path: 'getting-started',
    component: GettingStartedComponent,
    data: { title: 'Getting Started' },
    title: 'Getting Started · Elementar RT'
  },
  {
    path: 'basic',
    component: BasicDashboardComponent,
    data: { title: 'Basic Dashboard' },
    title: 'Dashboard · Elementar RT'
  },
  {
    path: 'analytics',
    component: AnalyticsDashboardComponent,
    data: { title: 'Analytics Dashboard' },
    title: 'Analytics · Elementar RT'
  },
  {
    path: 'ecommerce',
    component: EcommerceDashboardComponent,
    data: { title: 'eCommerce Dashboard' },
    title: 'eCommerce · Elementar RT'
  },
  {
    path: 'finance',
    component: FinanceDashboardComponent,
    data: { title: 'Finance Dashboard' },
    title: 'Finance · Elementar RT'
  },
  {
    path: 'explore',
    component: ExploreDashboardComponent,
    data: { title: 'Explore Dashboard' },
    title: 'Explore · Elementar RT'
  },
  {
    // Split out: the grid-layout library only loads for people who open this page.
    path: 'dynamic',
    loadComponent: () => import('./dynamic').then((m) => m.DynamicDashboardComponent),
    data: { title: 'Dynamic Dashboard' },
    title: 'Dynamic Dashboard · Elementar RT'
  }
];
