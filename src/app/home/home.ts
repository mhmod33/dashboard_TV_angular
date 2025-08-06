import { SystemService } from './../services/system/system.service';
import { AuthServiceService } from './../services/auth-service/auth-service.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class HomeComponent {
    currentUser: { name: string; avatar: string };
    allCustomers: any;
    allAdmins: any;
    constructor(
        private authService: AuthServiceService,
        private systemService: SystemService

    ) {
        this.currentUser = {
            name: this.authService.getUserName() ?? '',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        };
    }

    stats = [
        { title: 'Total Customers', value: 0, change: '+15%', icon: 'users', color: '#667eea' },
        { title: 'Total Admins', value: 0, change: '+2', icon: 'admin', color: '#10b981' },
        { title: 'Total Payments', value: '0', change: '', icon: 'payment', color: '#f59e0b' }
    ];

    ngOnInit() {
        this.systemService.allSuperCustomers().subscribe((res) => {
            this.allCustomers = res.customers.length;
            this.stats[0].value = this.allCustomers;
        });

        this.systemService.getAllAdmins().subscribe((res) => {
            this.allAdmins = res.admins.length;
            this.stats[1].value = this.allAdmins;
        });

        this.systemService.allPayments().subscribe((res: any) => {
            const totalPayments = res.payemnts.reduce((sum: number, payment: any) => {
                return sum + (Number(payment.cost) || 0);
            }, 0);
            this.stats[2].value = totalPayments.toLocaleString();
        });
    }
    getIconPath(icon: string): string {
        const icons: { [key: string]: string } = {
            users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
            admin: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
            payment: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
        };
        return icons[icon] || '';
    }


} 