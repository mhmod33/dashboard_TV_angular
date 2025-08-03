import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { PaymentHistoryComponent } from './payment-history/payment-history';
import { CustomersComponent } from './customers/customers';
import { AddCustomerComponent } from './add-customer/add-customer';
import { AdminUsersComponent } from './admin-users/admin-users';
import { AddAdminComponent } from './add-admin/add-admin';
import { SubAdminComponent } from './subadmin/subadmin';
import { AddSubAdminComponent } from './add-subadmin/add-subadmin';
import { LayoutComponent } from './layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent }
    ]
  },
  {
    path: 'payment-history',
    component: LayoutComponent,
    children: [
      { path: '', component: PaymentHistoryComponent }
    ]
  },
  {
    path: 'customers',
    component: LayoutComponent,
    children: [
      { path: '', component: CustomersComponent }
    ]
  },
  {
    path: 'add-customer',
    component: LayoutComponent,
    children: [
      { path: '', component: AddCustomerComponent }
    ]
  },
  {
    path: 'admin-users',
    component: LayoutComponent,
    children: [
      { path: '', component: AdminUsersComponent }
    ]
  },
  {
    path: 'add-admin',
    component: LayoutComponent,
    children: [
      { path: '', component: AddAdminComponent }
    ]
  },
  {
    path: 'subadmin',
    component: LayoutComponent,
    children: [
      { path: '', component: SubAdminComponent }
    ]
  },
  {
    path: 'add-subadmin',
    component: LayoutComponent,
    children: [
      { path: '', component: AddSubAdminComponent }
    ]
  }
];
