import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout';
import { SignInComponent } from './sign-in';
import { SignUpComponent } from './sign-up';
import { ForgotPasswordComponent } from './forgot-password';
import { PasswordResetComponent } from './password-reset';
import { SetNewPasswordComponent } from './set-new-password';
import { CreateAccountComponent } from './create-account';
import { AuthDoneComponent } from './done';

/**
 * `create-account` is listed first and outside the split layout: the setup wizard
 * owns the full page, while every other auth screen sits in the form column.
 */
export const authRoutes: Routes = [
  {
    path: 'create-account',
    component: CreateAccountComponent,
    data: { title: 'Create Account' },
    title: 'Create Account · Elementar RT'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
      { path: 'sign-in', component: SignInComponent, data: { title: 'Sign In' }, title: 'Sign In · Elementar RT' },
      { path: 'sign-up', component: SignUpComponent, data: { title: 'Sign Up' }, title: 'Sign Up · Elementar RT' },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { title: 'Forgot Password' },
        title: 'Forgot Password · Elementar RT'
      },
      {
        path: 'password-reset',
        component: PasswordResetComponent,
        data: { title: 'Password Reset' },
        title: 'Password Reset · Elementar RT'
      },
      {
        path: 'set-new-password',
        component: SetNewPasswordComponent,
        data: { title: 'Set New Password' },
        title: 'Set New Password · Elementar RT'
      },
      { path: 'done', component: AuthDoneComponent, data: { title: 'Done' }, title: 'All Done · Elementar RT' }
    ]
  }
];
