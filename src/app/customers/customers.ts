import { SystemService } from './../services/system/system.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../interfaces/customer';
import { AuthServiceService } from '../services/auth-service/auth-service.service';
import { Period } from '../interfaces/period';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
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

    customers: Customer[] = [];
    admins: any[] = [];
    periods: Period[] = [];
    currentUserRole: string = '';
    currentUserId: string = '';

    constructor(
        private router: Router,
        private systemService: SystemService,
        private authService: AuthServiceService
    ) { }
    
    // Calculate expiration date based on customer creation date and plan duration
    calculateExpirationDate(customer: Customer): Date | null {
        if (!customer.created_at || !customer.plan_id) {
            console.log('Missing created_at or plan_id for customer:', customer);
            return null;
        }
        
        // Find the period that matches the customer's plan_id
        // Convert both to numbers to ensure proper comparison
        const planId = Number(customer.plan_id);
        const period = this.periods.find(p => Number(p.id) === planId);
        
        if (!period) {
            console.log('No matching period found for plan_id:', planId, 'Available periods:', this.periods);
            return null;
        }
        
        // Create a date from the customer's creation date
        const creationDate = new Date(customer.created_at);
        if (isNaN(creationDate.getTime())) {
            console.log('Invalid creation date:', customer.created_at);
            return null;
        }
        
        // Add the period's months to the creation date
        const expirationDate = new Date(creationDate);
        
        // Use months field from Period interface as primary source
        // Fallback to duration_months if months is not available
        const monthsToAdd = period.months || period.duration_months || 0;
        
        console.log('Period details:', {
            periodId: period.id,
            periodCode: period.period_code,
            displayName: period.display_name,
            months: period.months,
            days: period.days,
            durationMonths: period.duration_months
        });
        
        expirationDate.setMonth(expirationDate.getMonth() + monthsToAdd);
        
        // If there are additional days in the period, add them too
        if (period.days && period.days > 0) {
            expirationDate.setDate(expirationDate.getDate() + period.days);
        }
        
        console.log('Calculated expiration date:', {
            customer: customer.customer_name,
            planId: planId,
            monthsToAdd: monthsToAdd,
            daysToAdd: period.days || 0,
            creationDate: creationDate,
            expirationDate: expirationDate
        });
        
        return expirationDate;
    }
    
    // Calculate remaining time in hours
    calculateRemainingDays(expirationDate: Date | null): { days: number, hours: number } | null {
        if (!expirationDate) {
            console.log('No expiration date provided');
            return null;
        }
        
        if (isNaN(expirationDate.getTime())) {
            console.log('Invalid expiration date:', expirationDate);
            return null;
        }
        
        const today = new Date();
        const diffTime = expirationDate.getTime() - today.getTime();
        
        // If expired, return 0 days and 0 hours
        if (diffTime <= 0) {
            return { days: 0, hours: 0 };
        }
        
        // Calculate days and remaining hours
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const remainingMs = diffTime % (1000 * 60 * 60 * 24);
        const diffHours = Math.floor(remainingMs / (1000 * 60 * 60));
        
        console.log('Remaining time calculation:', {
            expirationDate: expirationDate,
            today: today,
            diffTime: diffTime,
            diffDays: diffDays,
            diffHours: diffHours
        });
        
        return { days: diffDays, hours: diffHours };
    }
    
    // Format expiration date for display with time
    formatExpirationDate(expirationDate: Date | null): string {
        if (!expirationDate) {
            return 'N/A';
        }
        
        // Check if the date is valid before formatting
        if (isNaN(expirationDate.getTime())) {
            console.log('Invalid date in formatExpirationDate:', expirationDate);
            return 'Invalid Date';
        }
        
        try {
            // Use toLocaleString to include date and time
            return expirationDate.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Error';
        }
    }
    
    // Get remaining time with status color including hours
    getRemainingTimeStatus(timeRemaining: { days: number, hours: number } | null): { text: string, class: string } {
        if (timeRemaining === null || timeRemaining === undefined) {
            console.log('Null or undefined timeRemaining in getRemainingTimeStatus');
            return { text: 'N/A', class: '' };
        }
        
        const { days, hours } = timeRemaining;
        console.log('Getting status for time remaining:', { days, hours });
        
        if (days <= 0 && hours <= 0) {
            return { text: 'Expired', class: 'expired' };
        } else if (days === 0) {
            // Less than a day remaining
            return { text: `${hours} hours`, class: 'expiring-soon' };
        } else if (days <= 7) {
            // Less than a week remaining
            return { text: `${days} days, ${hours} hrs`, class: 'expiring-soon' };
        } else {
            // More than a week remaining
            return { text: `${days} days, ${hours} hrs`, class: 'active' };
        }
    }

    ngOnInit() {
        this.currentUserRole = this.authService.getRole() || '';
        this.currentUserId = this.authService.getCurrentUser()?.id?.toString() || '';
        
        // Load periods first to calculate expiration dates
        // loadCustomers will be called after periods are loaded
        this.loadPeriods();
        
        // Load admins if superadmin
        if (this.currentUserRole != 'subadmin') {
            this.loadAdmins();
        }
    }
    
    // Load all periods for expiration date calculation
    loadPeriods() {
        this.systemService.getAllPeriods().subscribe({
            next: (response: any) => {
                // Check if the response has a 'periods' property (PeriodRoot interface)
                if (response && response.periods) {
                    this.periods = response.periods;
                } else if (Array.isArray(response)) {
                    // If response is already an array, use it directly
                    this.periods = response;
                } else {
                    console.error('Unexpected periods response format:', response);
                    this.periods = [];
                }
                
                // Log the periods data for debugging
                console.log('Periods loaded successfully:', this.periods);
                
                // Ensure each period has the required duration fields
                this.periods.forEach(period => {
                    // Log each period for debugging
                    console.log('Period:', period);
                    
                    // Ensure months is set if duration_months is available but months is not
                    if (period.duration_months !== undefined && period.months === undefined) {
                        period.months = period.duration_months;
                    }
                    
                    // Ensure duration_months is set if months is available but duration_months is not
                    if (period.months !== undefined && period.duration_months === undefined) {
                        period.duration_months = period.months;
                    }
                    
                    // Set default values if neither is available
                    if (period.months === undefined && period.duration_months === undefined) {
                        console.warn('Period has no duration information:', period);
                        period.months = 0;
                        period.duration_months = 0;
                    }
                });
                
                // Load customers after periods are loaded
                this.loadCustomers();
            },
            error: (error) => {
                console.error('Error loading periods:', error);
                this.periods = [];
                // Still load customers even if periods failed to load
                this.loadCustomers();
            }
        });
    }

    // Update customer status based on expiration date
    updateCustomerStatus(customer: Customer): Customer {
        const expirationDate = this.calculateExpirationDate(customer);
        const remainingTime = this.calculateRemainingDays(expirationDate);
        
        // If remaining time is null or both days and hours are 0 or less, mark as expired
        if (remainingTime === null || (remainingTime.days <= 0 && remainingTime.hours <= 0)) {
            customer.status = 'expired';
        } else if (customer.status === 'expired' && (remainingTime.days > 0 || remainingTime.hours > 0)) {
            // If customer is marked as expired but has remaining time, correct it to active
            customer.status = 'active';
        }
        
        return customer;
    }
    
    loadCustomers() {
        this.isLoading = true;
        if (this.currentUserRole === 'superadmin') {
            // Superadmin sees all customers
            this.systemService.allSuperCustomers().subscribe({
                next: (res) => {
                    console.log('res', res);
                    this.customers = (res.customers || [])
                        .map((customer) => {
                            if (!customer.id) {
                                console.error('Customer missing ID:', customer);
                                return null;
                            }
                            customer.id = String(customer.id);
                            // Update customer status based on expiration date
                            return this.updateCustomerStatus(customer);
                        })
                        .filter((customer) => customer !== null) as Customer[];
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
                    // Update customer status based on expiration date
                    this.customers = (res.customers || []).map((customer: Customer) => this.updateCustomerStatus(customer));
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
            filtered = filtered.filter(
                (customer) =>
                    customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    customer.serial_number
                        .toLowerCase()
                        .includes(this.searchTerm.toLowerCase())
            );
        }

        // Apply view filter
        switch (this.currentView) {
            case 'active':
                filtered = filtered.filter((customer) => customer.status === 'active');
                break;
            case 'expired':
                filtered = filtered.filter((customer) => customer.status === 'expired');
                break;
            case 'paid':
                filtered = filtered.filter(
                    (customer) => customer.payment_status === 'paid'
                );
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
            this.selectedCustomers = this.filteredCustomers.map((c) => c.id);
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
        this.selectAll =
            this.selectedCustomers.length === this.filteredCustomers.length;
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
        if (!customerId) {
            console.error('No customer ID provided');
            return;
        }
        console.log('Attempting to edit customer with ID:', customerId);
        this.router.navigate(['/edit-customer', customerId]);
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