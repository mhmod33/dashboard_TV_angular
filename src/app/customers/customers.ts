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

        // Apply the selected bulk action
        switch (this.bulkAction) {
            case 'enable':
                console.log('Enable selected customers:', this.selectedCustomers);
                break;
            case 'disable':
                console.log('Disable selected customers:', this.selectedCustomers);
                break;
            case 'mark-paid':
                console.log('Mark selected customers as paid:', this.selectedCustomers);
                break;
            case 'mark-unpaid':
                console.log('Mark selected customers as unpaid:', this.selectedCustomers);
                break;
        }

        // Reset selection
        this.selectedCustomers = [];
        this.selectAll = false;
    }

    // Export functionality
    exportToExcel() {
        console.log('Exporting customers to Excel...');
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
        console.log('Delete customer:', customerId);
    }

    isCustomerSelected(customerId: string): boolean {
        return this.selectedCustomers.includes(customerId);
    }
} 