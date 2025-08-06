import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { Payemnt, PaymentRoot } from '../interfaces/payment';

@Component({
    selector: 'app-payment-history',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './payment-history.html',
    styleUrl: './payment-history.css'
})
export class PaymentHistoryComponent {
    confirmingPaymentId: number | null = null;
    constructor(
        private systemService: SystemService,
        private router: Router
    ) { }

    payments: Payemnt[] = [];

    ngOnInit(): void {
        console.log('new')
        this.systemService.allPayments().subscribe((res: any) => {
            console.log('res', res.payments.length);
            this.payments = res.payemnts;
        })
    }

    // Navigate to add payment page
    addPayment(): void {
        this.router.navigate(['/add-payment']);
    }

    // Show confirmation dialog for delete
    confirmDelete(payment: Payemnt): void {
        this.confirmingPaymentId = payment.id;
    }

    // Cancel confirmation dialog
    cancelDelete(): void {
        this.confirmingPaymentId = null;
    }

    // Delete payment (after confirmation)
    deletePayment(paymentId: number): void {
        this.systemService.deletePayment(paymentId).subscribe({
            next: (res) => {
                console.log('Payment deleted successfully');
                this.confirmingPaymentId = null;
                // Reload payments
                this.loadPayments();
            },
            error: (error) => {
                console.error('Error deleting payment:', error);
                alert('Error deleting payment. Please try again.');
            }
        });
    }

    // Reload payments
    loadPayments(): void {
        this.systemService.allPayments().subscribe((res: any) => {
            this.payments = res.payemnts;
        });
    }
} 