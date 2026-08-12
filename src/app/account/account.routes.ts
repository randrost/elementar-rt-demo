import { Routes } from '@angular/router';
import { AccountNotificationsComponent } from './notifications';
import { AccountSettingsShellComponent } from './settings/settings-shell';
import { MyProfileComponent } from './settings/my-profile';
import { AccountSecurityComponent } from './settings/security';
import { NotificationPrefsComponent } from './settings/notification-prefs';
import { AccountBillingComponent } from './settings/billing';
import { AccountSessionsComponent } from './settings/sessions';
import { AccountCookieComponent } from './settings/cookie';
import { AccountPaymentComponent } from './settings/payment';

export const accountRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notifications' },
  {
    path: 'notifications',
    component: AccountNotificationsComponent,
    data: { title: 'Notifications' },
    title: 'Notifications · Elementar RT'
  },
  {
    path: 'settings',
    component: AccountSettingsShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'my-profile' },
      { path: 'my-profile', component: MyProfileComponent, data: { title: 'My Profile' }, title: 'My Profile · Elementar RT' },
      { path: 'security', component: AccountSecurityComponent, data: { title: 'Security' }, title: 'Security · Elementar RT' },
      {
        path: 'notifications',
        component: NotificationPrefsComponent,
        data: { title: 'Notification Settings', variant: 'table' },
        title: 'Notification Settings · Elementar RT'
      },
      {
        path: 'notifications-2',
        component: NotificationPrefsComponent,
        data: { title: 'Notification Settings', variant: 'cards' },
        title: 'Notification Settings · Elementar RT'
      },
      {
        path: 'billing',
        component: AccountBillingComponent,
        data: { title: 'Billing', variant: 'table' },
        title: 'Billing · Elementar RT'
      },
      {
        path: 'billing-2',
        component: AccountBillingComponent,
        data: { title: 'Billing', variant: 'cards' },
        title: 'Billing · Elementar RT'
      },
      { path: 'sessions', component: AccountSessionsComponent, data: { title: 'Sessions' }, title: 'Sessions · Elementar RT' },
      { path: 'cookie', component: AccountCookieComponent, data: { title: 'Cookies' }, title: 'Cookies · Elementar RT' },
      { path: 'payment', component: AccountPaymentComponent, data: { title: 'Payment' }, title: 'Payment · Elementar RT' }
    ]
  }
];
