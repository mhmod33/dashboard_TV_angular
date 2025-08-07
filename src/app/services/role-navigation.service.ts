import { Injectable } from '@angular/core';
import { AuthServiceService } from './auth-service/auth-service.service';

export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  requiredRole: string | string[];
  section?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleNavigationService {
  private navigationItems: NavigationItem[] = [
    // Dashboard - accessible to all authenticated users (superadmin, Admin, Sub Admin)
    { path: '/home', label: 'Dashboard', icon: 'dashboard', requiredRole: ['superadmin', 'admin', 'subadmin'] },

    // Payment History - accessible to all authenticated users (superadmin, Admin, Sub Admin)
    { path: '/payment-history', label: 'Payment History', icon: 'payment', requiredRole: ['superadmin', 'admin', 'subadmin'] },

    // Customers - accessible to all authenticated users (superadmin, Admin, Sub Admin)
    { path: '/customers', label: 'EgyBest Customers', icon: 'customers', requiredRole: ['superadmin', 'admin', 'subadmin'] },

    // Admin Controller Section
    // Admin Users - only accessible to superadmin
    { path: '/admin-users', label: 'Admin Users', icon: 'admin', requiredRole: 'superadmin', section: 'Admin Controller' },
    // SubAdmin - accessible to superadmin and Admin only
    { path: '/subadmin', label: 'SubAdmin', icon: 'subadmin', requiredRole: ['superadmin', 'admin'], section: 'Admin Controller' },

    // System Management Section - accessible to all authenticated users (superadmin, Admin, Sub Admin)
    { path: '/default-prices', label: 'Default Prices', icon: 'prices', requiredRole: ['superadmin', 'admin', 'subadmin'], section: 'System Management' },
    { path: '/time-periods', label: 'Time Periods', icon: 'time', requiredRole: ['superadmin', 'admin', 'subadmin'], section: 'System Management' },
    { path: '/remove-customer', label: 'Remove Customer by SN', icon: 'remove', requiredRole: ['superadmin', 'admin', 'subadmin'], section: 'System Management' },

    // superadmin Only Section
    { path: '/delete-all-customers', label: 'Delete All Customers', icon: 'delete', requiredRole: 'superadmin' }
  ];

  constructor(private authService: AuthServiceService) { }

  getNavigationItems(): NavigationItem[] {
    const userRole = this.authService.getRole();
    if (!userRole) return [];

    return this.navigationItems.filter(item => this.hasRequiredRole(userRole, item.requiredRole));
  }

  getNavigationItemsBySection(): { [key: string]: NavigationItem[] } {
    const items = this.getNavigationItems();
    const grouped: { [key: string]: NavigationItem[] } = {};

    items.forEach(item => {
      const section = item.section || 'Main';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(item);
    });

    return grouped;
  }

  canAccessRoute(routePath: string): boolean {
    const userRole = this.authService.getRole();
    if (!userRole) return false;

    const item = this.navigationItems.find(nav => nav.path === routePath);
    if (!item) return false;

    return this.hasRequiredRole(userRole, item.requiredRole);
  }

  private hasRequiredRole(userRole: string, requiredRole: string | string[]): boolean {
    if (!userRole) return false;
    
    // Normalize user role
    const normalizedUserRole = userRole.toLowerCase();
    
    // Handle array of required roles
    if (Array.isArray(requiredRole)) {
        const normalizedRequiredRoles = requiredRole.map(r => r.toLowerCase());
        return normalizedRequiredRoles.some(r => 
            r === normalizedUserRole ||
            (r === 'superadmin' && normalizedUserRole === 'super admin') ||
            (r === 'super admin' && normalizedUserRole === 'superadmin') ||
            (r === 'subadmin' && normalizedUserRole === 'sub admin') ||
            (r === 'sub admin' && normalizedUserRole === 'subadmin')
        );
    }
    
    // Normalize required role
    const normalizedRequiredRole = requiredRole.toLowerCase();
    
    // Check for exact match or known variations
    return normalizedUserRole === normalizedRequiredRole ||
        (normalizedUserRole === 'superadmin' && normalizedRequiredRole === 'super admin') ||
        (normalizedUserRole === 'super admin' && normalizedRequiredRole === 'superadmin') ||
        (normalizedUserRole === 'subadmin' && normalizedRequiredRole === 'sub admin') ||
        (normalizedUserRole === 'sub admin' && normalizedRequiredRole === 'subadmin');
}

  getUserRole(): string | null {
    return this.authService.getRole();
  }

  isSuperAdmin(): boolean {
    const role = this.authService.getRole();
    return role ? role.toLowerCase() === 'superadmin' || role.toLowerCase() === 'super admin' : false;
  }

  isAdmin(): boolean {
    const role = this.authService.getRole();
    return role === 'admin' || role === 'superadmin';
  }

  isSubAdmin(): boolean {
    return this.authService.getRole() === 'subadmin';
  }
}