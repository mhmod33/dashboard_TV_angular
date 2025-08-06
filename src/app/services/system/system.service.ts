import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRoot } from '../../interfaces/payment';
import { CustomerRoot } from '../../interfaces/customer';
import { SubadminRoot } from '../../interfaces/subadmin';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private base = 'http://127.0.0.1:8000';

  private payments = `${this.base}/api/payments`;
  private allCustomers = `${this.base}/api/customers`;
  // private activeCustomers = `${this.base}/api/customers`;
  // private expiredCustomers = `${this.base}/api/customers`;
  // private paidCustomers = `${this.base}/api/customers`;

  private allAdmins = `${this.base}/api/superadmin/admins`;
  private allSubadmins = `${this.base}/api/subadmins`;

  private AddCustomer = `${this.base}/api/customers`
  private AddmyCustomer = `${this.base}/api/myCustomers`
  private deletecustomer = `${this.base}/api/customers`
  private updatebalance = `${this.base}/api/superadmin/update-balance`
  private decreasebalance = `${this.base}/api/superadmin/decrease-balance`
  private getCustomerBySn = `${this.base}/api/getcustomerbysn`

  constructor(private http: HttpClient) { }


  allPayments(): Observable<PaymentRoot[]> {
    return this.http.get<PaymentRoot[]>(this.payments)
  }

  allSuperCustomers(): Observable<CustomerRoot> {
    return this.http.get<CustomerRoot>(this.allCustomers);
  }
  // getActiveCustomers(): Observable<CustomerRoot> {
  //   return this.http.get<CustomerRoot>(this.activeCustomers);
  // }
  getAllAdmins(): Observable<AdminRoot> {
    return this.http.get<AdminRoot>(this.allAdmins)
  }

  getAllSubadmins(): Observable<SubadminRoot> {
    return this.http.get<SubadminRoot>(this.allSubadmins)
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

  addAdmin(data:any):Observable<any>{
    return this.http.post(this.allAdmins,data);
  }
  updateBalance(adminId: string, balance: number): Observable<any> {
    return this.http.patch(`${this.updatebalance}/${adminId}`, {
      balance: balance
    });
  }
  decreaseBalance(adminId: string, balance: number): Observable<any> {
    return this.http.patch(`${this.decreasebalance}/${adminId}`, {
      balance: balance
    });
  }

  updateAdmin(adminId: string, data: any): Observable<any> {
    return this.http.patch(`${this.allAdmins}/${adminId}`, data);
  }


  // Bulk action methods
  bulkUpdateStatus(customerIds: string[], status: string): Observable<any> {
    return this.http.put<any>(`${this.allCustomers}/bulk/status`, {
      customer_ids: customerIds,
      status: status
    });
  }

  bulkUpdatePaymentStatus(customerIds: string[], paymentStatus: string): Observable<any> {
    return this.http.put<any>(`${this.allCustomers}/bulk/payment-status`, {
      customer_ids: customerIds,
      payment_status: paymentStatus
    });
  }

  getCustomerBysn(data: any): Observable<any> {
    return this.http.post<any>(this.getCustomerBySn, data)
  }

  getMyCustomers(): Observable<any> {
    return this.http.get<any>(this.AddmyCustomer);
  }




  // Uncomment when API is ready
  /*
  checkSerialNumber(serialNumber: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.checkSN}/${serialNumber}`);
  }
  */

}
