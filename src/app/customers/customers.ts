import { SystemService } from './../services/system/system.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../interfaces/customer';
import { AuthServiceService } from '../services/auth-service/auth-service.service';

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
    
    // Loading states
    isLoading = true;
    isLoadingAdmins = false;
    
    // Search and filter properties
    searchTerm = '';
    nameFilter = '';
    customerFilter = 'All My Customers';
    rowsPerPage = 25;
    selectedAdminId = '';

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
    admins: any[] = [];
    currentUserRole: string = '';
    currentUserId: string = '';

    constructor(
        private router: Router,
        private systemService: SystemService,
        private authService: AuthServiceService
    ) { }

    ngOnInit() {
        this.currentUserRole = this.authService.getRole() || '';
        this.currentUserId = this.authService.getCurrentUser()?.id?.toString() || '';
        
        this.loadCustomers();
        
        // Load admins if superadmin
        if (this.currentUserRole != 'subadmin') {
            this.loadAdmins();
        }
    }

    loadCustomers() {
        this.isLoading = true;
        if (this.currentUserRole === 'superadmin') {
            // Superadmin sees all customers
            this.systemService.allSuperCustomers().subscribe({
                next: (res) => {
                    console.log('res', res);
                    this.customers = res.customers || [];
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading customers:', error);
                    this.customers = [];
                    this.isLoading = false;
                }
            });
        } else {
            // Admin and subadmin see their own customers
            this.systemService.getMyCustomers().subscribe({
                next: (res) => {
                    console.log('My customers:', res);
                    this.customers = res.customers || [];
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading customers:', error);
                    this.customers = [];
                    this.isLoading = false;
                }
            });
        }
    }

    loadAdmins() {
        this.isLoadingAdmins = true;
        this.systemService.getAllAdmins().subscribe({
            next: (res) => {
                console.log(res);
                this.admins = res.admins || [];
                this.isLoadingAdmins = false;
            },
            error: (error) => {
                console.error('Error loading admins:', error);
                this.admins = [];
                this.isLoadingAdmins = false;
            }
        });
    }

    // Filter customers by selected admin (for superadmin only)
    filterCustomersByAdmin() {
        if (this.currentUserRole === 'superadmin' && this.selectedAdminId) {
            // Get admin details which includes customers
            this.systemService.getAdminById(this.selectedAdminId).subscribe({
                next: (res) => {
                    if (res.admin && res.admin.customers) {
                        this.customers = res.admin.customers;
                    } else {
                        this.customers = [];
                    }
                },
                error: (error) => {
                    console.error('Error loading customers by admin:', error);
                    this.customers = [];
                }
            });
        } else if (this.currentUserRole === 'superadmin' && !this.selectedAdminId) {
            // If no admin selected, show all customers
            this.loadCustomers();
        } else {
            this.loadCustomers();
        }
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
        
        if (this.bulkAction === 'delete-selected') {
            this.deleteSelectedCustomers();
            return;
        }
        
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
                            this.loadCustomers();
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
                            this.loadCustomers();
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
                            this.loadCustomers();
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
                            this.loadCustomers();
                        },
                        error: (error) => {
                            this.showInfoModal('Error marking customers as unpaid. Please try again.');
                        }
                    });
                    break;
                case 'change-owner':
                    this.showChangeOwnerModal();
                    break;
            }
        };
    }

    showChangeOwnerModal() {
        this.showModal = true;
        this.modalType = 'confirm';
        this.modalTitle = 'Change Owner';
        this.modalMessage = 'Please select a new admin to assign the selected customers to.';
        // This will be handled in the template with a custom modal
    }

    changeOwner(newAdminId: string) {
        if (!newAdminId) {
            this.showInfoModal('Please select an admin');
            return;
        }

        this.systemService.bulkUpdateOwner(this.selectedCustomers, newAdminId).subscribe({
            next: (res) => {
                this.showInfoModal('Owner changed successfully');
                this.selectedCustomers = [];
                this.selectAll = false;
                this.loadCustomers();
            },
            error: (error) => {
                this.showInfoModal('Error changing owner. Please try again.');
                console.error('Error changing owner:', error);
            }
        });
    }

    deleteSelectedCustomers() {
        this.showModal = true;
        this.modalType = 'confirm';
        this.modalTitle = 'Delete Selected Customers';
        this.modalMessage = `Are you sure you want to delete ${this.selectedCustomers.length} selected customers? This action cannot be undone.`;
        this.modalAction = () => {
            // Use the new bulk delete method
            this.systemService.bulkDeleteSelected(this.selectedCustomers).subscribe({
                next: (res) => {
                    this.showInfoModal('Selected customers deleted successfully');
                    this.selectedCustomers = [];
                    this.selectAll = false;
                    this.loadCustomers();
                },
                error: (error) => {
                    this.showInfoModal('Error deleting customers. Please try again.');
                    console.error('Error deleting customers:', error);
                }
            });
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
                    this.loadCustomers();
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
            if (this.bulkAction === 'change-owner') {
                this.changeOwner(this.selectedAdminId);
            } else if (this.bulkAction === 'delete-selected') {
                this.modalAction();
            } else {
                this.modalAction();
            }
            this.modalAction = null;
        } else if (this.bulkAction === 'change-owner') {
            this.changeOwner(this.selectedAdminId);
            this.showModal = false;
        } else if (this.bulkAction === 'delete-selected') {
            // Handle delete-selected when modalAction is null
            this.systemService.bulkDeleteSelected(this.selectedCustomers).subscribe({
                next: (res) => {
                    this.showInfoModal('Selected customers deleted successfully');
                    this.selectedCustomers = [];
                    this.selectAll = false;
                    this.loadCustomers();
                },
                error: (error) => {
                    this.showInfoModal('Error deleting customers. Please try again.');
                    console.error('Error deleting customers:', error);
                }
            });
            this.showModal = false;
        }
    }

    isCustomerSelected(customerId: string): boolean {
        return this.selectedCustomers.includes(customerId);
    }
} 