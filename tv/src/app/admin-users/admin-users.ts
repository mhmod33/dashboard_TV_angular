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
    searchTerm = '';

    // Sample admin users data
    // adminUsers = [
    //     {
    //         id: 161,
    //         username: 'moksha',
    //         balance: 480,
    //         status: 'admin',
    //         customers: 25
    //     },
    //     {
    //         id: 162,
    //         username: 'ahmedmedhat',
    //         balance: 1250,
    //         status: 'superadmin',
    //         customers: 150
    //     },
    //     {
    //         id: 163,
    //         username: 'sarah_admin',
    //         balance: 320,
    //         status: 'subadmin',
    //         customers: 12
    //     },
    //     {
    //         id: 164,
    //         username: 'mohamed_tech',
    //         balance: 890,
    //         status: 'admin',
    //         customers: 67
    //     }
    // ];
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
        console.log('Applying filter:', {
            searchTerm: this.searchTerm,
            idFilter: this.idFilter,
            sortOrder: this.sortOrder
        });
    }

    // Add admin functionality
    addAdmin() {
        this.router.navigate(['/add-admin']);
    }

    // Action methods for individual admin users
    editAdmin(adminId: number) {
        console.log('Edit admin:', adminId);
    }

    deleteAdmin(adminId: number) {
        console.log('Delete admin:', adminId);
    }

    viewAdminDetails(adminId: number) {
        console.log('View admin details:', adminId);
        // Here you would typically navigate to a details page or open a modal
        alert(`Viewing details for admin ID: ${adminId}`);
    }

    // Get status display info
    getStatusInfo(status: string) {
        const statusMap: { [key: string]: { label: string, color: string } } = {
            'superadmin': { label: 'Super Admin', color: '#dc2626' },
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