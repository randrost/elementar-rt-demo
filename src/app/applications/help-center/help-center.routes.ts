import { Routes } from '@angular/router';
import { HelpHomeComponent } from './home';
import { HelpFaqComponent } from './faq';
import { HelpGuidesComponent } from './guides';
import { HelpSupportComponent } from './support';

export const helpCenterRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HelpHomeComponent, data: { title: 'Help Center' }, title: 'Help Center · Elementar RT' },
  { path: 'faq', component: HelpFaqComponent, data: { title: 'FAQ' }, title: 'FAQ · Elementar RT' },
  { path: 'guides', component: HelpGuidesComponent, data: { title: 'Guides' }, title: 'Guides · Elementar RT' },
  { path: 'support', component: HelpSupportComponent, data: { title: 'Support' }, title: 'Support · Elementar RT' }
];
