import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-users.html',
    styleUrl: './admin-users.css'
})
export class AdminUsersComponent {
    // Filter properties
    idFilter = '';
    sortOrder = 'descending';
    searchTerm: string = '';



    adminUsers: Admin[] = [];
    constructor(
        private router: Router,
        private systemService: SystemService
    ) { }
    ngOnInit() {
        this.systemService.getAllAdmins().subscribe((res) => {
            this.adminUsers = res.admins
        })
    }
    // Filtered and sorted admin users
    get filteredAdminUsers() {
        let filtered = this.adminUsers;

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(admin =>
                admin.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                admin.id.toString().includes(this.searchTerm)
            );
        }

        // Apply ID filter
        if (this.idFilter) {
            filtered = filtered.filter(admin =>
                admin.id.toString().includes(this.idFilter)
            );
        }

        // Apply sorting
        if (this.sortOrder === 'descending') {
            filtered = filtered.sort((a, b) => b.id - a.id);
        } else {
            filtered = filtered.sort((a, b) => a.id - b.id);
        }

        return filtered;
    }

    // Filter methods
    applyFilter() {
        // This method is now only needed to trigger Angular change detection if used with (ngModelChange)
        // Filtering is handled by the filteredAdminUsers getter
    }

    // Add admin functionality
    addAdmin() {
        this.router.navigate(['/add-admin']);
    }

    // Action methods for individual admin users
    editAdmin(adminId: number) {
        console.log('Edit admin:', adminId);
        this.router.navigate(['/edit-admin', adminId]);
    }

    deleteAdmin(adminId: number) {
        if (confirm('Are you sure you want to delete this admin?')) {
            this.systemService.deleteAdmin(adminId).subscribe({
                next: (res) => {
                    console.log('Admin deleted successfully');
                    this.loadAdmins();
                },
                error: (error) => {
                    console.error('Error deleting admin:', error);
                    alert('Error deleting admin. Please try again.');
                }
            });
        }
    }

    addBalance(adminId: number) {
        console.log('Add balance for admin:', adminId);
        this.router.navigate(['/add-balance', adminId]);
    }

    managePrices(adminId: number) {
        // Only allow navigating for subadmins; disable handled in template too
        this.router.navigate(['/manage-prices', adminId]);
    }

    banAdmin(adminId: number) {
        if (confirm('Are you sure you want to ban this admin?')) {
            this.systemService.banAdmin(adminId).subscribe({
                next: (res) => {
                    console.log('Admin banned successfully');
                    this.loadAdmins();
                },
                error: (error) => {
                    console.error('Error banning admin:', error);
                    alert('Error banning admin. Please try again.');
                }
            });
        }
    }

    viewAdminDetails(adminId: number) {
        console.log('View admin details:', adminId);
        this.router.navigate(['/admin-details', adminId]);
    }

    // Load admins
    loadAdmins() {
        this.systemService.getAllAdmins().subscribe((res) => {
            this.adminUsers = res.admins;
        });
    }

    // Get status display info
    getStatusInfo(status: string) {
        const statusMap: { [key: string]: { label: string, color: string } } = {
            'superadmin': { label: 'superadmin', color: '#dc2626' },
            'admin': { label: 'Admin', color: '#059669' },
            'subadmin': { label: 'Sub Admin', color: '#7c3aed' }
        };
        return statusMap[status] || { label: status, color: '#64748b' };
    }

    // Get status badge class
    getStatusClass(status: string): string {
        const statusClasses: { [key: string]: string } = {
            'superadmin': 'status-superadmin',
            'admin': 'status-admin',
            'subadmin': 'status-subadmin'
        };
        return statusClasses[status] || 'status-default';
    }
} 