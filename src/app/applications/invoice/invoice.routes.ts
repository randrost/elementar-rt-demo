import { Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list';
import { InvoiceDetailsComponent } from './invoice-details';
import { InvoiceFormComponent } from './invoice-form';

export const invoiceRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: InvoiceListComponent, data: { title: 'Invoices' }, title: 'Invoices · Elementar RT' },
  { path: 'new', component: InvoiceFormComponent, data: { title: 'New Invoice' }, title: 'New Invoice · Elementar RT' },
  {
    path: 'details/:id',
    component: InvoiceDetailsComponent,
    data: { title: 'Invoice Details' },
    title: 'Invoice · Elementar RT'
  },
  {
    path: 'edit/:id',
    component: InvoiceFormComponent,
    data: { title: 'Edit Invoice' },
    title: 'Edit Invoice · Elementar RT'
  }
];
