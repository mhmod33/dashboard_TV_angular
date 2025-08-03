import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-payment-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-history.html',
    styleUrl: './payment-history.css'
})
export class PaymentHistoryComponent {
    payments = [
        {
            id: 'PAY001',
            date: '2024-01-15',
            type: 'Credit Card',
            code: 'CC001234',
            customerName: 'Ahmed Mohamed',
            owner: 'Admin',
            duration: '30 days',
            expBefore: '2024-01-15',
            expAfter: '2024-02-15',
            cost: '$25.00'
        },
        {
            id: 'PAY002',
            date: '2024-01-14',
            type: 'PayPal',
            code: 'PP567890',
            customerName: 'Sarah Ali',
            owner: 'Admin',
            duration: '90 days',
            expBefore: '2024-01-14',
            expAfter: '2024-04-14',
            cost: '$60.00'
        },
        {
            id: 'PAY003',
            date: '2024-01-13',
            type: 'Bank Transfer',
            code: 'BT123456',
            customerName: 'Mohamed Hassan',
            owner: 'Admin',
            duration: '180 days',
            expBefore: '2024-01-13',
            expAfter: '2024-07-13',
            cost: '$100.00'
        }
    ];
} 