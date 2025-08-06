import { Routes } from '@angular/router';
import { DefaultPricesComponent } from './default-prices/default-prices.component';
import { TimePeriodsComponent } from './time-periods/time-periods.component';
import { RemoveCustomerComponent } from './remove-customer/remove-customer.component';
import { DeleteAllCustomersComponent } from './delete-all-customers/delete-all-customers.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ProfileComponent } from './profile/profile';
import { LoginComponent } from './login/login';
import { LayoutComponent } from './layout/layout';
import { PaymentHistoryComponent } from './payment-history/payment-history';
import { HomeComponent } from './home/home';
import { CustomersComponent } from './customers/customers';
import { SubadminCustomersComponent } from './subadmin-customers/subadmin-customers';
import { AddBalanceComponent } from './add-balance/add-balance';
import { AddPaymentComponent } from './add-payment/add-payment';
import { AddSubAdminComponent } from './add-subadmin/add-subadmin';
import { SubAdminComponent } from './subadmin/subadmin';
import { AddAdminComponent } from './add-admin/add-admin';
import { AdminUsersComponent } from './admin-users/admin-users';
import { AddCustomerComponent } from './add-customer/add-customer';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Dashboard
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent }
    ]
  },

  // Payment History
  {
    path: 'payment-history',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: PaymentHistoryComponent }
    ]
  },

  // Customers
  {
    path: 'customers',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: CustomersComponent }
    ]
  },
  {
    path: 'add-customer',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: AddCustomerComponent }
    ]
  },

  // Admin Users - superadmin only
  {
    path: 'admin-users',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'superadmin' },
    children: [
      { path: '', component: AdminUsersComponent }
    ]
  },
  {
    path: 'add-admin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'superadmin' },
    children: [
      { path: '', component: AddAdminComponent }
    ]
  },

  // SubAdmin - superadmin and Admin only
  {
    path: 'subadmin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['superadmin', 'admin'] },
    children: [
      { path: '', component: SubAdminComponent }
    ]
  },
  {
    path: 'add-subadmin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['superadmin', 'admin'] },
    children: [
      { path: '', component: AddSubAdminComponent }
    ]
  },

  // Default Prices
  {
    path: 'default-prices',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['superadmin', 'admin', 'subadmin'] },
    children: [
      { path: '', component: DefaultPricesComponent }
    ]
  },

  // Time Periods
  {
    path: 'time-periods',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['superadmin', 'admin', 'subadmin'] },
    children: [
      { path: '', component: TimePeriodsComponent }
    ]
  },

  // Remove Customer
  {
    path: 'remove-customer',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['superadmin', 'admin', 'subadmin'] },
    children: [
      { path: '', component: RemoveCustomerComponent }
    ]
  },

  // Delete All Customers - superadmin only
  {
    path: 'delete-all-customers',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'superadmin' },
    children: [
      { path: '', component: DeleteAllCustomersComponent }
    ]
  },

  // Other routes
  {
    path: 'add-payment',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: AddPaymentComponent }
    ]
  },
  {
    path: 'add-balance/:id',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: AddBalanceComponent }
    ]
  },
  {
    path: 'subadmin-customers/:id',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: SubadminCustomersComponent }
    ]
  },
  {
    path: 'admin-details/:id',
    loadComponent: () => import('./admin-details/admin-details').then(m => m.AdminDetailsComponent)
  },
  {
    path: 'edit-admin/:id',
    loadComponent: () => import('./edit-admin/edit-admin').then(m => m.EditAdminComponent)
  },
  {
    path: 'profile',
    component: LayoutComponent,
    children: [
      { path: '', component: ProfileComponent }
    ]
  }
];