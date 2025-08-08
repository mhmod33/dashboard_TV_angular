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
        this.systemService.getAllSubadmins().subscribe((res) => {
            this.subadmins = res.subadmins
            console.log(res.subadmins)
        })
        this.systemService.getMysubadmins().subscribe((res) => {
            console.log(res.subadmins)
            this.mySubadminslength = res.subadmins.length
        })
        this.systemService.getMysubadmins().subscribe((res) => {
            // console.log(res.subadmins)
            this.allMySubadmins = res.subadmins
        })
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
        // console.log('View customer details');
    }

    viewCreditTransferDetails() {
        // console.log('View credit transfer details');
    }
} 