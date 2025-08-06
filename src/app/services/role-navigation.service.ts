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
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }

    // Role hierarchy: superadmin > admin > subadmin
    const roleHierarchy = {
      'superadmin': 3,
      'admin': 2,
      'subadmin': 1
    };

    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  getUserRole(): string | null {
    return this.authService.getRole();
  }

  isSuperAdmin(): boolean {
    return this.authService.getRole() === 'superadmin';
  }

  isAdmin(): boolean {
    const role = this.authService.getRole();
    return role === 'admin' || role === 'superadmin';
  }

  isSubAdmin(): boolean {
    return this.authService.getRole() === 'subadmin';
  }
}