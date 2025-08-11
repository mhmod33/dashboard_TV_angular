import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { ModalService } from '../services/modal.service';

@Component({
    selector: 'app-subadmin-customers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './subadmin-customers.html',
    styleUrl: './subadmin-customers.css'
})
export class SubadminCustomersComponent implements OnInit {
    customers: any[] = [];
    subadminUsername: string = '';
    searchTerm = '';
    currentView = 'all';
    adminId: any
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private systemService: SystemService,
        private modalService: ModalService
    ) { }

    ngOnInit() {
        this.subadminUsername = this.route.snapshot.paramMap.get('username') || '';
        this.adminId = this.route.snapshot.paramMap.get('id') || '';
        this.loadCustomers();
    }

    loadCustomers() {
        // Get admin details which includes customers
        this.systemService.getAdminById(this.adminId).subscribe({
            next: (res: any) => {
                console.log('response', res);
                if (res.admin && res.admin.customers) {
                    this.customers = res.admin.customers;
                } else {
                    this.customers = [];
                }
            },
            error: (error: any) => {
                console.error('Error loading customers:', error);
                this.customers = [];
            }
        });
    }

    // Filtered customers based on current view
    get filteredCustomers() {
        let filtered = this.customers;

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(customer =>
                customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                customer.serial_number.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        // Apply view filter
        switch (this.currentView) {
            case 'active':
                filtered = filtered.filter(customer => customer.status === 'active');
                break;
            case 'expired':
                filtered = filtered.filter(customer => customer.status === 'expired');
                break;
            case 'paid':
                filtered = filtered.filter(customer => customer.payment_status === 'paid');
                break;
        }

        return filtered;
    }

    // View filter methods
    setView(view: string) {
        this.currentView = view;
    }

    // Search functionality
    performSearch() {
        console.log('Performing search with:', this.searchTerm);
    }

    // Export functionality
    exportToExcel() {
        console.log('Exporting customers to Excel...');

        // Prepare data for export
        const exportData = this.filteredCustomers.map(customer => ({
            'Customer Name': customer.name,
            'Serial Number': customer.serial_number,
            'Status': customer.status,
            'Payment Status': customer.payment_status,
            'Created Date': customer.created_at,
            'Address': customer.address || '',
            'Phone': customer.phone || ''
        }));

        // Create CSV content
        const headers = Object.keys(exportData[0] || {}) as string[];
        const csvContent = [
            headers.join(','),
            ...exportData.map((row: any) => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `customers_${this.subadminUsername}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Action methods for individual customers
    editCustomer(customerId: string) {
        console.log('Edit customer:', customerId);
        this.router.navigate(['/edit-customer', customerId]);
    }

    deleteCustomer(customerId: string) {
        this.modalService.showConfirm(
            'Confirm Delete',
            'Are you sure you want to delete this customer?',
            () => {
                this.systemService.deleteCustomer(String(customerId)).subscribe({
                    next: (res) => {
                        console.log('Customer deleted successfully');
                        this.loadCustomers();
                    },
                    error: (error: any) => {
                        console.error('Error deleting customer:', error);
                        this.modalService.showErrorMessage('Error deleting customer. Please try again.');
                    }
                });
            }
        );
    }

    // Navigate back to subadmin page
    goBack() {
        this.router.navigate(['/subadmin']);
    }
} 