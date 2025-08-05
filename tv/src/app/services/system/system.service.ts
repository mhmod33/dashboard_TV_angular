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
  private allAdmins = `${this.base}/api/superadmin/admins`;
  private allSubadmins = `${this.base}/api/subadmins`;
  constructor(private http: HttpClient) { }


  allPayments(): Observable<PaymentRoot[]> {
    return this.http.get<PaymentRoot[]>(this.payments)
  }

  allSuperCustomers(): Observable<CustomerRoot> {
    return this.http.get<CustomerRoot>(this.allCustomers);
  }

  getAllAdmins(): Observable<AdminRoot> {
    return this.http.get<AdminRoot>(this.allAdmins)
  }
  
  getAllSubadmins(): Observable<SubadminRoot> {
    return this.http.get<SubadminRoot>(this.allSubadmins)
  }
}
