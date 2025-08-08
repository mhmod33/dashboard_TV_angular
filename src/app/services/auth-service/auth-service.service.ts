import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  message: string;
  name: string;
  role: string;
  balance: any;
  token: string;
  id: any;
  status: string;
}

interface Subadmin {
  id: number;
  name: string;
  password: string;
  status: string;
  role: string;
  balance: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  parent_admin_id: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private base = 'http://127.0.0.1:8000';
  private authStatusSubject = new BehaviorSubject<boolean>(this.hasToken());
  authStatus$ = this.authStatusSubject.asObservable();

  // Role permissions mapping based on the access matrix
  private rolePermissions: { [key: string]: string[] } = {
    superadmin: [
      'dashboard',
      'payment-history',
      'customers',
      'admin-users',
      'subadmin',
      'default-prices',
      'time-periods',
      'remove-customer'
    ],
    admin: [
      'dashboard',
      'customers',
      'subadmin',
    ],
    subadmin: [
      'dashboard',
      'customers',
    ],
    // Add normalized versions of the roles
    'super admin': [
      'dashboard',
      'payment-history',
      'customers',
      'admin-users',
      'subadmin',
      'default-prices',
      'time-periods',
      'remove-customer',
    ],
    'sub admin': [
      'dashboard',
      'customers',
    ],
  };

  constructor(private http: HttpClient, private router: Router) {}

  login(name: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/api/login`, { name, password })
      .pipe(
        tap((res) => {
          this.setSession(
            res.token,
            res.role,
            res.name,
            res.id,
            res.balance,
            res.status
          );
          this.authStatusSubject.next(true);
        })
      );
  }

  // Add method to check page access
  canAccess(page: string): boolean {
    const role = this.getRole();
    if (!role) return false;

    // Normalize role to lowercase for consistent comparison
    let normalizedRole = role.toLowerCase();

    // Handle both formats of superadmin role
    if (normalizedRole === 'super admin') {
      normalizedRole = 'superadmin';
    }

    // Check if the normalized role exists in rolePermissions
    return this.rolePermissions[normalizedRole]?.includes(page) || false;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private setSession(
    token: string,
    role: string,
    name: string,
    id: any,
    balance: any,
    status: string
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('balance', balance);
    localStorage.setItem('status', status);
    localStorage.setItem('name', name);
    localStorage.setItem('id', id);

    // Normalize the role to lowercase and handle all variations
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'super admin' || normalizedRole === 'superadmin') {
      localStorage.setItem('role', 'superadmin');
    } else if (normalizedRole === 'sub admin' || normalizedRole === 'subadmin') {
      localStorage.setItem('role', 'subadmin');
    } else {
      localStorage.setItem('role', normalizedRole);
    }
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(`${this.base}/api/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearSession();
        this.authStatusSubject.next(false);
        this.router.navigate(['/login']);
      })
    );
  }

  private clearSession() {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserName(): string | null {
    return localStorage.getItem('name');
  }

  getRole(): string | null {
    const role = localStorage.getItem('role');
    if (!role) return null;

    // Ensure consistent role naming
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'super admin') {
      return 'superadmin';
    }
    if (normalizedRole === 'sub admin') {
      return 'subadmin';
    }
    return normalizedRole;
  }

  getBalance(): any {
    return localStorage.getItem('balance');
  }

  getStatus(): string | null {
    return localStorage.getItem('status');
  }

  getCurrentUser(): Subadmin | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      id: Number(localStorage.getItem('id')) || 0,
      name: this.getUserName() || '',
      password: '',
      status: this.getStatus() || '',
      role: this.getRole() || '',
      balance: this.getBalance(),
      created_at: '',
      updated_at: '',
      deleted_at: null,
      parent_admin_id: null,
    };
  }
}