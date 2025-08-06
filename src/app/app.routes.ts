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
import { DefaultPricesComponent } from './default-prices/default-prices.component';
import { TimePeriodsComponent } from './time-periods/time-periods.component';
import { RemoveCustomerComponent } from './remove-customer/remove-customer.component';
import { DeleteAllCustomersComponent } from './delete-all-customers/delete-all-customers.component';
import { AddPaymentComponent } from './add-payment/add-payment';
import { AddBalanceComponent } from './add-balance/add-balance';
import { SubadminCustomersComponent } from './subadmin-customers/subadmin-customers';
import { AuthGuard } from './guards/auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

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
  
  // Admin Users - Super Admin only
  {
    path: 'admin-users',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'super admin' },
    children: [
      { path: '', component: AdminUsersComponent }
    ]
  },
  {
    path: 'add-admin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'super admin' },
    children: [
      { path: '', component: AddAdminComponent }
    ]
  },
  
  // SubAdmin - Super Admin and Admin only
  {
    path: 'subadmin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['super admin', 'admin'] },
    children: [
      { path: '', component: SubAdminComponent }
    ]
  },
  {
    path: 'add-subadmin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['super admin', 'admin'] },
    children: [
      { path: '', component: AddSubAdminComponent }
    ]
  },
  
  // Default Prices
  {
    path: 'default-prices',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['super admin', 'admin', 'sub admin'] },
    children: [
      { path: '', component: DefaultPricesComponent }
    ]
  },
  
  // Time Periods
  {
    path: 'time-periods',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['super admin', 'admin', 'sub admin'] },
    children: [
      { path: '', component: TimePeriodsComponent }
    ]
  },
  
  // Remove Customer
  {
    path: 'remove-customer',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: ['super admin', 'admin', 'sub admin'] },
    children: [
      { path: '', component: RemoveCustomerComponent }
    ]
  },
  
  // Delete All Customers - Super Admin only
  {
    path: 'delete-all-customers',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'super admin' },
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
    path: 'subadmin-customers/:username',
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
  }
];