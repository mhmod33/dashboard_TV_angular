import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-subadmin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './subadmin.html',
    styleUrl: './subadmin.css'
})
export class SubAdminComponent {
    // Summary stats
    summaryStats = {
        totalSubAdmins: 1,
        allocatedBalance: 0,
        availableBalance: 0,
        totalCustomers: 0,
        totalCreditTransfers: 0
    };

    // Sub-admin performance data
    subAdminPerformance = [
        {
            username: 'mhmod33',
            balance: 0,
            acasCustomers: 0,
            created: '2025-08-01'
        }
    ];

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

    constructor(private router: Router) { }

    // Navigation methods
    addNewSubAdmin() {
        this.router.navigate(['/add-subadmin']);
    }

    viewSubAdminDashboard() {
        console.log('Viewing sub-admin dashboard');
    }

    // Action methods for sub-admin performance
    addBalance(username: string) {
        console.log('Add balance for:', username);
    }

    setPrices(username: string) {
        console.log('Set prices for:', username);
    }

    viewCustomers(username: string) {
        console.log('View customers for:', username);
    }

    viewStats(username: string) {
        console.log('View stats for:', username);
    }

    // View details methods
    viewSubAdminDetails(username: string) {
        console.log('View details for:', username);
    }

    viewBalanceDetails() {
        console.log('View balance details');
    }

    viewCustomerDetails() {
        console.log('View customer details');
    }

    viewCreditTransferDetails() {
        console.log('View credit transfer details');
    }
} 