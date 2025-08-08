import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { SubadminRoot } from '../interfaces/subadmin';
import { AuthServiceService } from '../services/auth-service/auth-service.service';

@Component({
    selector: 'app-subadmin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './subadmin.html',
    styleUrl: './subadmin.css'
})
export class SubAdminComponent {
    getRole: string;
    mySubadminslength: any
    subadmins: any;
    allMySubadmins: any

    // Loading states
    isLoading = true;
    isLoadingSubadmins = false;

    // Summary stats
    summaryStats = {
        totalSubAdmins: 1,
        allocatedBalance: 0,
        availableBalance: 0,
        totalCustomers: 0,
        totalCreditTransfers: 0
    };

    // Recent transactions
    recentTransactions = [
        {
            date: '2025-08-01 20:14',
            subAdmin: 'mhmod33',
            amount: 0,
            notes: 'Initial balance for new sub-admin: mhmod33'
        }
    ];

    // Recent customers
    recentCustomers: any[] = [];

    constructor(
        private router: Router,
        private systemService: SystemService,
        private authService: AuthServiceService
    ) {
        this.getRole = this.authService.getRole() ?? ''
    }

    ngOnInit() {
        this.isLoading = true;
        this.isLoadingSubadmins = true;
        
        this.systemService.getAllSubadmins().subscribe({
            next: (res) => {
                this.subadmins = res.subadmins;
                console.log(res.subadmins);
                this.isLoadingSubadmins = false;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading subadmins:', error);
                this.subadmins = [];
                this.isLoadingSubadmins = false;
                this.isLoading = false;
            }
        });
        
        this.systemService.getMysubadmins().subscribe({
            next: (res) => {
                console.log(res.subadmins);
                this.mySubadminslength = res.subadmins.length;
            },
            error: (error) => {
                console.error('Error loading my subadmins:', error);
                this.mySubadminslength = 0;
            }
        });
        
        this.systemService.getMysubadmins().subscribe({
            next: (res) => {
                this.allMySubadmins = res.subadmins;
            },
            error: (error) => {
                console.error('Error loading all my subadmins:', error);
                this.allMySubadmins = [];
            }
        });

        // Load total customers for superadmin only
        if (this.getRole === 'superadmin') {
            this.loadTotalCustomers();
        }
    }

    loadTotalCustomers() {
        this.systemService.allSuperCustomers().subscribe({
            next: (res) => {
                this.summaryStats.totalCustomers = res.customers ? res.customers.length : 0;
            },
            error: (error) => {
                console.error('Error loading total customers:', error);
                this.summaryStats.totalCustomers = 0;
            }
        });
    }
    // Navigation methods
    addNewSubAdmin() {
        this.router.navigate(['/add-subadmin']);
    }

    viewSubAdminDashboard() {
        console.log('Viewing sub-admin dashboard');
    }

    // Action methods for sub-admin performance
    // addBalance(username: string) {
    //     console.log('Add balance for:', username);
    //     this.router.navigate(['/add-subadmin-balance', username]);
    // }

    addBalance(adminId: number) {
        // console.log('Add balance for admin:', adminId);
        this.router.navigate(['/add-balance', adminId]);
    }
    setPrices(username: string) {
        // console.log('Set prices for:', username);
        this.router.navigate(['/set-prices', username]);
    }

    viewCustomers(id: string) {
        // console.log('View customers for:', id);
        this.router.navigate(['/subadmin-customers', id]);
    }

    viewStats(username: string) {
        // console.log('View stats for:', username);
    }

    // View details methods
    viewSubAdminDetails(username: string) {
        // console.log('View details for:', username);
    }

    viewBalanceDetails() {
        // console.log('View balance details');
    }

    viewCustomerDetails() {
        // Navigate to customers page
        this.router.navigate(['/customers']);
    }

    viewCreditTransferDetails() {
        // console.log('View credit transfer details');
    }
} 