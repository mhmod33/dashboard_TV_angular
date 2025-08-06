import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthServiceService } from '../services/auth-service/auth-service.service';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  section?: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit {
  isSidebarOpen = true;
  showLogoutAlert = false;
  currentUser: { name: string; avatar: string; balance: number; role: string };
  
  // Define all possible navigation items with required roles
  private allNavigationItems: NavigationItem[] = [
    { path: '/home', label: 'Dashboard', icon: 'dashboard', section: 'Main', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/payment-history', label: 'Payment History', icon: 'payment', section: 'Main', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/customers', label: 'Customers', icon: 'customers', section: 'Main', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/admin-users', label: 'Admin Users', icon: 'admin', section: 'Administration', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/subadmin', label: 'SubAdmin', icon: 'subadmin', section: 'Administration', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/default-prices', label: 'Default Prices', icon: 'prices', section: 'Settings', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/time-periods', label: 'Time Periods', icon: 'time', section: 'Settings', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/remove-customer', label: 'Remove Customer', icon: 'remove', section: 'Actions', roles: ['super admin', 'admin', 'subadmin'] },
    { path: '/delete-all-customers', label: 'Delete All Customers', icon: 'delete', section: 'Actions', roles: ['super admin', 'admin', 'subadmin'] }
  ];

  navigationItems: NavigationItem[] = [];
  navigationBySection: { [key: string]: NavigationItem[] } = {};

  constructor(
    public router: Router,
    private authService: AuthServiceService
  ) {
    this.currentUser = {
      name: this.authService.getUserName() ?? '',
      balance: 2500,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      role: this.authService.getRole() ?? ''
    };
  }

  ngOnInit(): void {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    const userRole = this.authService.getRole();
    
    if (!userRole) {
      console.error('User role not found');
      return;
    }

    // Filter items based on user role
    this.navigationItems = this.allNavigationItems.filter(item => 
      item.roles.includes(userRole.toLowerCase())
    );

    // Group by section
    this.navigationBySection = this.navigationItems.reduce((acc, item) => {
      const section = item.section || 'Main';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(item);
      return acc;
    }, {} as { [key: string]: NavigationItem[] });
  }

  getIconPath(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'dashboard': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'payment': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'customers': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'admin': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'subadmin': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'prices': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'time': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'remove': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      'delete': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    };
    return iconMap[icon] || '';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.showLogoutAlert = true;
  }

  confirmLogout() {
    this.showLogoutAlert = false;
    this.authService.logout().subscribe();
  }

  cancelLogout() {
    this.showLogoutAlert = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}