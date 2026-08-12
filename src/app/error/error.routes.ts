import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found';
import { NotFound2Component } from './not-found-2';
import { ServerErrorComponent } from './server-error';
import { ServerError2Component } from './server-error-2';
import { ForbiddenComponent } from './forbidden';
import { Forbidden2Component } from './forbidden-2';
import { MaintenanceComponent } from './maintenance';

export const errorRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'not-found' },
  { path: 'not-found', component: NotFoundComponent, title: 'Page Not Found · Elementar RT' },
  { path: 'not-found-2', component: NotFound2Component, title: 'Page Not Found · Elementar RT' },
  { path: 'server-error', component: ServerErrorComponent, title: 'Server Error · Elementar RT' },
  { path: 'server-error-2', component: ServerError2Component, title: 'Server Error · Elementar RT' },
  { path: 'forbidden', component: ForbiddenComponent, title: 'Access Denied · Elementar RT' },
  { path: 'forbidden-2', component: Forbidden2Component, title: 'Access Denied · Elementar RT' },
  { path: 'maintenance', component: MaintenanceComponent, title: 'Maintenance · Elementar RT' }
];
