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
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent }
    ]
  },
  {
    path: 'payment-history',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: PaymentHistoryComponent }
    ]
  },
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
    data: { role: ['superadmin', 'admin'] },
    children: [
      { path: '', component: AddAdminComponent }
    ]
  },
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
  {
    path: 'default-prices',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DefaultPricesComponent }
    ]
  },
  {
    path: 'time-periods',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TimePeriodsComponent }
    ]
  },
  {
    path: 'remove-customer',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: RemoveCustomerComponent }
    ]
  },
  {
    path: 'delete-all-customers',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'superadmin' },
    children: [
      { path: '', component: DeleteAllCustomersComponent }
    ]
  },
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
  }
];
