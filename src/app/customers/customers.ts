import { SystemService } from './../services/system/system.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../interfaces/customer';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customers.html',
    styleUrl: './customers.css'
})
export class CustomersComponent {
    showModal = false;
    modalTitle = '';
    modalMessage = '';
    modalType: 'confirm' | 'info' = 'info';
    modalAction: (() => void) | null = null;
    // Search and filter properties
    searchTerm = '';
    nameFilter = '';
    customerFilter = 'All My Customers';
    rowsPerPage = 25;

    // View filter
    currentView = 'all'; // 'all', 'active', 'expired', 'paid'

    // Bulk actions
    bulkAction = '';
    selectAll = false;
    selectedCustomers: string[] = [];

    // Sample customers data
    // customers = [
    //     {
    //         id: '1',
    //         name: 'Ahmed Mohamed',
    //         deviceSN: 'SN001234',
    //         owner: 'Admin',
    //         startDate: '2024-01-01',
    //         endDate: '2024-02-01',
    //         remaining: '15 days',
    //         status: 'active',
    //         paid: true
    //     },
    //     {
    //         id: '2',
    //         name: 'Sarah Ali',
    //         deviceSN: 'SN567890',
    //         owner: 'Admin',
    //         startDate: '2024-01-15',
    //         endDate: '2024-02-15',
    //         remaining: '30 days',
    //         status: 'active',
    //         paid: true
    //     },
    //     {
    //         id: '3',
    //         name: 'Mohamed Hassan',
    //         deviceSN: 'SN123456',
    //         owner: 'Admin',
    //         startDate: '2023-12-01',
    //         endDate: '2024-01-01',
    //         remaining: 'Expired',
    //         status: 'expired',
    //         paid: false
    //     }
    // ];
    customers: Customer[] = [];
    constructor(
        private router: Router,
        private systemService: SystemService
    ) { }

    ngOnInit() {
        this.systemService.allSuperCustomers().subscribe((res) => {
            console.log('res', res)
            this.customers = res.customers
        })

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

    // Bulk action methods
    toggleSelectAll() {
        this.selectAll = !this.selectAll;
        if (this.selectAll) {
            this.selectedCustomers = this.filteredCustomers.map(c => c.id);
        } else {
            this.selectedCustomers = [];
        }
    }

    toggleCustomerSelection(customerId: string) {
        const index = this.selectedCustomers.indexOf(customerId);
        if (index > -1) {
            this.selectedCustomers.splice(index, 1);
        } else {
            this.selectedCustomers.push(customerId);
        }
        this.updateSelectAllState();
    }

    updateSelectAllState() {
        this.selectAll = this.selectedCustomers.length === this.filteredCustomers.length;
    }

    applyBulkAction() {
        if (!this.bulkAction || this.selectedCustomers.length === 0) return;
        this.showModal = true;
        this.modalType = 'confirm';
        this.modalTitle = 'Confirm Bulk Action';
        this.modalMessage = `Are you sure you want to apply '${this.bulkAction}' to selected customers?`;
        this.modalAction = () => {
            switch (this.bulkAction) {
                case 'enable':
                    this.systemService.bulkUpdateStatus(this.selectedCustomers, 'active').subscribe({
                        next: (res) => {
                            this.showInfoModal('Customers enabled successfully');
                            this.selectedCustomers = [];
                            this.selectAll = false;
                        },
                        error: (error) => {
                            this.showInfoModal('Error enabling customers. Please try again.');
                        }
                    });
                    break;
                case 'disable':
                    this.systemService.bulkUpdateStatus(this.selectedCustomers, 'expired').subscribe({
                        next: (res) => {
                            this.showInfoModal('Customers disabled successfully');
                            this.selectedCustomers = [];
                            this.selectAll = false;
                        },
                        error: (error) => {
                            this.showInfoModal('Error disabling customers. Please try again.');
                        }
                    });
                    break;
                case 'mark-paid':
                    this.systemService.bulkUpdatePaymentStatus(this.selectedCustomers, 'paid').subscribe({
                        next: (res) => {
                            this.showInfoModal('Customers marked as paid successfully');
                            this.selectedCustomers = [];
                            this.selectAll = false;
                        },
                        error: (error) => {
                            this.showInfoModal('Error marking customers as paid. Please try again.');
                        }
                    });
                    break;
                case 'mark-unpaid':
                    this.systemService.bulkUpdatePaymentStatus(this.selectedCustomers, 'unpaid').subscribe({
                        next: (res) => {
                            this.showInfoModal('Customers marked as unpaid successfully');
                            this.selectedCustomers = [];
                            this.selectAll = false;
                        },
                        error: (error) => {
                            this.showInfoModal('Error marking customers as unpaid. Please try again.');
                        }
                    });
                    break;
            }
        };
    }

    // Export functionality
    exportToExcel() {
        console.log('Exporting customers to Excel...');

        // Prepare data for export
        const exportData = this.filteredCustomers.map(customer => ({
            'Customer Name': customer.name,
            'Serial Number': customer.serial_number,
            'Owner': customer.owner,
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
            ...exportData.map(row => headers.map(header => `"${(row as any)[header] || ''}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Add customer functionality
    addCustomer() {
        this.router.navigate(['/add-customer']);
    }

    // Search functionality
    performSearch() {
        console.log('Performing search with:', this.searchTerm);
    }

    // Action methods for individual customers
    editCustomer(customerId: string) {
        console.log('Edit customer:', customerId);
    }

    deleteCustomer(customerId: string) {
        this.showModal = true;
        this.modalType = 'confirm';
        this.modalTitle = 'Delete Customer';
        this.modalMessage = 'Are you sure you want to delete this customer?';
        this.modalAction = () => {
            this.systemService.deleteCustomer(customerId).subscribe({
                next: () => {
                    this.showInfoModal('Customer deleted successfully!');
                },
                error: () => {
                    this.showInfoModal('Error deleting customer. Please try again.');
                }
            });
        };
    }
    showInfoModal(message: string) {
        this.showModal = true;
        this.modalType = 'info';
        this.modalTitle = 'Notification';
        this.modalMessage = message;
        this.modalAction = null;
    }

    closeModal() {
        this.showModal = false;
        this.modalAction = null;
    }

    confirmModal() {
        if (this.modalAction) {
            this.showModal = false;
            this.modalAction();
            this.modalAction = null;
        }
    }

    isCustomerSelected(customerId: string): boolean {
        return this.selectedCustomers.includes(customerId);
    }
} 