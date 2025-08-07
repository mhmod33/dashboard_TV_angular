import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthServiceService } from '../services/auth-service/auth-service.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink],
    templateUrl: './layout.html',
    styleUrl: './layout.css',
})
export class LayoutComponent {
    isSidebarOpen = true;
    showLogoutAlert = false;
    currentUser: { name: string; avatar: string; balance: number; role: string };
    allowedPages: string[] = [];

    constructor(public router: Router, private authService: AuthServiceService) {
        this.currentUser = {
            name: this.authService.getUserName() ?? '',
            balance: this.authService.getBalance(),
            avatar:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            role: this.authService.getRole() ?? '',
        };
        this.getAllowedPages();
    }

    private getAllowedPages() {
        // This method is now just for reference
        // The actual page access is determined by authService.canAccess
        const role = this.authService.getRole();
        console.log('Current user role:', role);
        
        // For debugging purposes, log if delete-all-customers is allowed
        const canAccessDeleteAll = this.authService.canAccess('delete-all-customers');
        console.log('Can access delete-all-customers:', canAccessDeleteAll);
        
        if (role) {
            const normalizedRole = role.toLowerCase();
            if (normalizedRole === 'superadmin' || normalizedRole === 'super admin') {
                // superadmin has access to all pages
                this.allowedPages = [
                    'dashboard',
                    'payment-history',
                    'customers',
                    'admin-users',
                    'subadmin',
                    'default-prices',
                    'time-periods',
                    'remove-customer',
                    'delete-all-customers',
                ];
            } else if (normalizedRole === 'admin') {
                // Admin has access to most pages except admin-users and delete-all-customers
                this.allowedPages = [
                    'dashboard',
                    'payment-history',
                    'customers',
                    'subadmin',
                    'default-prices',
                    'time-periods',
                    'remove-customer',
                ];
            } else if (normalizedRole === 'subadmin' || normalizedRole === 'sub admin') {
                // Sub Admin has limited access
                this.allowedPages = [
                    'dashboard',
                    'payment-history',
                    'customers',
                    'default-prices',
                    'time-periods',
                    'remove-customer',
                ];
            }
        }
    }

    isPageAllowed(page: string): boolean {
        return this.authService.canAccess(page);
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    logout() {
        // Show Bootstrap alert for confirmation
        this.showLogoutAlert = true;
    }

    confirmLogout() {
        console.log('Logging out...');
        this.showLogoutAlert = false;
        this.authService.logout().subscribe();
    }

    cancelLogout() {
        this.showLogoutAlert = false;
    }

    navigateToPaymentHistory() {
        this.router.navigate(['/payment-history']);
    }

    navigateToHome() {
        this.router.navigate(['/home']);
    }

    navigateToCustomers() {
        this.router.navigate(['/customers']);
    }

    navigateToAdminUsers() {
        this.router.navigate(['/admin-users']);
    }

    navigateToSubAdmin() {
        this.router.navigate(['/subadmin']);
    }

    navigateToProfile() {
        this.router.navigate(['/profile']);
    }

    getIconPath(route: string): string {
        const iconMap: { [key: string]: string } = {
            dashboard:
                'M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z',
            payment:
                'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            customers: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
            admin:
                'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
            subadmin: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
            delete:
                'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z',
            remove: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
            logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
            prices:
                'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            time: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z',
            user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
            settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
        };
        return iconMap[route] || '';
    }
}
