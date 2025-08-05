import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { Payemnt, PaymentRoot } from '../interfaces/payment';

@Component({
    selector: 'app-payment-history',
    standalone: true,
    imports: [CommonModule,RouterLink],
    templateUrl: './payment-history.html',
    styleUrl: './payment-history.css'
})
export class PaymentHistoryComponent {
    constructor(
        private systemService: SystemService,
        private router: Router
    ) { }

    payments: Payemnt[] = [];

    ngOnInit(): void {
        console.log('new')
        this.systemService.allPayments().subscribe((res: any) => {
            console.log('res', res);
            this.payments = res.payemnts;
        })
    }

    // Navigate to add payment page
    addPayment(): void {
        this.router.navigate(['/add-payment']);
    }

    // Delete payment
    deletePayment(paymentId: number): void {
        if (confirm('Are you sure you want to delete this payment?')) {
            this.systemService.deletePayment(paymentId).subscribe({
                next: (res) => {
                    console.log('Payment deleted successfully');
                    // Reload payments
                    this.loadPayments();
                },
                error: (error) => {
                    console.error('Error deleting payment:', error);
                    alert('Error deleting payment. Please try again.');
                }
            });
        }
    }

    // Reload payments
    loadPayments(): void {
        this.systemService.allPayments().subscribe((res: any) => {
            this.payments = res.payemnts;
        });
    }
} 