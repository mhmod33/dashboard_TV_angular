import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { PaymentRoot } from '../../interfaces/payment';
import { CustomerRoot } from '../../interfaces/customer';
import { SubadminRoot } from '../../interfaces/subadmin';
import { AuthServiceService } from '../auth-service/auth-service.service';
import { Period } from '../../interfaces/period';
import { BalanceService } from '../balance/balance.service';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private base = 'http://127.0.0.1:8000';

  private payments = `${this.base}/api/payments`;
  private allCustomers = `${this.base}/api/customers`;
  private allAdmins = `${this.base}/api/admins`;
  private adminPeriods = `${this.base}/api/admins`;
  private allSubadmins = `${this.base}/api/subadmins`;
  private superadmin = `${this.base}/api/superadmin/superadminProfile`;
  private admin = `${this.base}/api/subadminProfile`;
  private AddCustomer = `${this.base}/api/customers`;
  private AddmyCustomer = `${this.base}/api/myCustomers`;
  private deletecustomer = `${this.base}/api/customers`;
  private updatebalance = `${this.base}/api/superadmin/update-balance`;
  private decreasebalance = `${this.base}/api/superadmin/decrease-balance`;
  private getCustomerBySn = `${this.base}/api/getcustomerbysn`;
  private periods = `${this.base}/api/periods`;
  private getCustomersByAdminId = `${this.base}/api/customers/by-admin`;
  private subadminEndpoint = `${this.base}/api/add-subadmin`;
  private getMySubadmins = `${this.base}/api/getMySubadmins`;

  constructor(
    private http: HttpClient,
    private authService: AuthServiceService,
    private balanceService: BalanceService
  ) {}

  // In system.service.ts
  getAllPeriods(): Observable<Period[]> {
    return this.http
      .get<Period[] | { periods: Period[] }>(this.periods)
      .pipe(
        map((response) =>
          Array.isArray(response) ? response : response.periods
        )
      );
  }

  allPayments(): Observable<PaymentRoot[]> {
    return this.http.get<PaymentRoot[]>(this.payments);
  }

  allSuperCustomers(): Observable<CustomerRoot> {
    return this.http.get<CustomerRoot>(this.allCustomers);
  }

  getAllAdmins(): Observable<any> {
    return this.http.get<any>(this.allAdmins);
  }

  getAllSubadmins(): Observable<SubadminRoot> {
    return this.http.get<SubadminRoot>(this.allSubadmins);
  }

  addCustomer(data: CustomerRoot): Observable<any> {
    return this.http.post<any>(this.AddCustomer, data);
  }

  addMyCustomer(data: CustomerRoot): Observable<any> {
    return this.http.post<any>(this.AddmyCustomer, data);
  }

  addPayment(data: any): Observable<any> {
    return this.http.post<any>(this.payments, data);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.deletecustomer}/${id}`);
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.payments}/${id}`);
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.allAdmins}/${id}`);
  }

  banAdmin(id: number): Observable<any> {
    return this.http.put(`${this.allAdmins}/ban/${id}`, {});
  }

  getAdminById(id: string): Observable<any> {
    return this.http.get(`${this.allAdmins}/${id}`);
  }

  addBalance(data: any): Observable<any> {
    return this.http.post(`${this.allAdmins}/balance`, data);
  }

  // Add this method to support the subadmin-specific endpoint
  addSubAdmin(data: any): Observable<any> {
    return this.http.post<any>(this.subadminEndpoint, data);
  }

  // Period methods
  // getAllPeriods(): Observable<any> {
  //   return this.http.get<any>(this.periods);
  // }
  getMysubadmins(): Observable<SubadminRoot> {
    return this.http.get<SubadminRoot>(this.getMySubadmins);
  }
  addPeriod(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.post<any>(this.periods, data, { headers });
  }

  updatePeriod(id: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.put<any>(`${this.periods}/${id}`, data, { headers });
  }

  // Per-admin overrides
  getAdminPeriods(adminId: number): Observable<Period[]> {
    return this.http
      .get<{ periods: Period[] }>(`${this.adminPeriods}/${adminId}/periods`)
      .pipe(map((r) => r.periods));
  }

  upsertAdminPeriods(adminId: number, overrides: Array<{ period_id: number; price?: number; plan?: number }>): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.put(`${this.adminPeriods}/${adminId}/periods`, { overrides }, { headers });
  }

  deletePeriod(id: string): Observable<any> {
    return this.http.delete<any>(`${this.periods}/${id}`);
  }

  // Admin balance method
  getAdminBalance(): Observable<any> {
    return this.http.get<any>(`${this.base}/api/admin/balance`);
  }

  addAdmin(data: any): Observable<any> {
    return this.http.post(this.allAdmins, data);
  }

  updateBalance(adminId: string, balance: number): Observable<any> {
    return this.http.patch(`${this.updatebalance}/${adminId}`, {
      balance: balance,
    }).pipe(
      tap((response: any) => {
        const currentUserRole = localStorage.getItem('role');
        
        // Update the current user's balance in the balance service after successful API call
        if (currentUserRole === 'superadmin' && response.superadmin) {
          // If superadmin increasing admin's balance, update superadmin's balance
          this.balanceService.updateBalance(parseFloat(response.superadmin.balance));
        } else if (currentUserRole === 'admin' && response.current_user) {
          // If admin increasing subadmin's balance, update admin's balance
          this.balanceService.updateBalance(parseFloat(response.current_user.balance));
        } else if (response.admin && response.admin.balance) {
          // Default case
          this.balanceService.updateBalance(parseFloat(response.admin.balance));
        }
      })
    );
  }

  decreaseBalance(adminId: string, balance: number): Observable<any> {
    return this.http.patch(`${this.decreasebalance}/${adminId}`, {
      balance: balance,
    }).pipe(
      tap((response: any) => {
        const currentUserRole = localStorage.getItem('role');
        
        // Update the current user's balance in the balance service after successful API call
        if (currentUserRole === 'superadmin' && response.superadmin) {
          // If superadmin decreasing admin's balance, update superadmin's balance
          this.balanceService.updateBalance(parseFloat(response.superadmin.balance));
        } else if (currentUserRole === 'admin' && response.current_user) {
          // If admin decreasing subadmin's balance, update admin's balance
          this.balanceService.updateBalance(parseFloat(response.current_user.balance));
        } else if (response.admin && response.admin.balance) {
          // Default case
          this.balanceService.updateBalance(parseFloat(response.admin.balance));
        }
      })
    );
  }

  updateAdmin(adminId: string, data: any): Observable<any> {
    return this.http.patch(`${this.allAdmins}/${adminId}`, data);
  }

  getSuperadminProfile(id: string): Observable<any> {
    return this.http.get<any>(this.superadmin);
  }

  getAdminProfile(id: string): Observable<any> {
    return this.http.get<any>(this.admin);
  }

  // Bulk action methods
  bulkUpdateStatus(customerIds: string[], status: string): Observable<any> {
    return this.http.put<any>(`${this.allCustomers}/bulk/status`, {
      customer_ids: customerIds,
      status: status,
    });
  }

  bulkUpdatePaymentStatus(
    customerIds: string[],
    paymentStatus: string
  ): Observable<any> {
    return this.http.put<any>(`${this.allCustomers}/bulk/payment-status`, {
      customer_ids: customerIds,
      payment_status: paymentStatus,
    });
  }

  bulkUpdateOwner(customerIds: string[], adminId: string): Observable<any> {
    return this.http.put<any>(`${this.allCustomers}/bulk/changeadmin`, {
      customer_ids: customerIds,
      admin_id: adminId,
    });
  }

  bulkDeleteSelected(customerIds: string[]): Observable<any> {
    return this.http.put<any>(`${this.allCustomers}/bulk/delete`, {
      customer_ids: customerIds,
    });
  }

  getCustomerBysn(data: any): Observable<any> {
    return this.http.post<any>(this.getCustomerBySn, data);
  }

  getMyCustomers(): Observable<any> {
    return this.http.get<any>(this.AddmyCustomer);
  }

  getCustomerById(customerId: string): Observable<Customer> {
    return this.http
      .get<{ customer: Customer }>(`${this.allCustomers}/${customerId}`)
      .pipe(map((response) => response.customer));
  }

  updateCustomer(customerId: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    return this.http.put<any>(`${this.allCustomers}/${customerId}`, data, {
      headers,
    });
  }
}
