import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-customer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-customer.html',
    styleUrl: './add-customer.css'
})
export class AddCustomerComponent {
    // Form data
    customerData = {
        serialNumber: '',
        customerName: '',
        address: '',
        phone: '',
        planDuration: '1',
        paymentStatus: 'paid'
    };

    // Validation states
    errors = {
        serialNumber: '',
        customerName: '',
        address: '',
        phone: ''
    };

    // Plan options
    planOptions = [
        { id: '1', name: '1 Month', value: '120000' },
        { id: '3', name: '3 Months', value: '120' },
        { id: '6', name: '6 Months', value: '1600000' },
        { id: '12', name: '12 Months', value: '3200000' }
    ];

    // Payment status options
    paymentOptions = [
        { id: 'unpaid', name: 'Unpaid' },
        { id: 'paid', name: 'Paid' }
    ];

    // User balance
    userBalance = 0;

    constructor(private router: Router) { }

    // Validation methods
    validateSerialNumber(): boolean {
        if (!this.customerData.serialNumber) {
            this.errors.serialNumber = 'SN is required';
            return false;
        }
        if (this.customerData.serialNumber.length !== 12) {
            this.errors.serialNumber = 'SN must be exactly 12 characters';
            return false;
        }
        this.errors.serialNumber = '';
        return true;
    }

    validateCustomerName(): boolean {
        if (!this.customerData.customerName.trim()) {
            this.errors.customerName = 'Customer name is required';
            return false;
        }
        this.errors.customerName = '';
        return true;
    }

    validateForm(): boolean {
        const isSerialValid = this.validateSerialNumber();
        const isNameValid = this.validateCustomerName();
        return isSerialValid && isNameValid;
    }

    // Plan selection
    selectPlan(planId: string): void {
        this.customerData.planDuration = planId;
    }

    // Payment status selection
    selectPaymentStatus(status: string): void {
        this.customerData.paymentStatus = status;
    }

    // Form submission
    saveCustomer(): void {
        if (this.validateForm()) {
            console.log('Saving customer:', this.customerData);
            // Here you would typically make an API call to save the customer
            alert('Customer saved successfully!');
            this.router.navigate(['/customers']);
        }
    }

    // Cancel form
    cancelForm(): void {
        this.router.navigate(['/customers']);
    }

    // Check if plan is selected
    isPlanSelected(planId: string): boolean {
        return this.customerData.planDuration === planId;
    }

    // Check if payment status is selected
    isPaymentSelected(status: string): boolean {
        return this.customerData.paymentStatus === status;
    }

    // Get selected plan details
    getSelectedPlan() {
        return this.planOptions.find(plan => plan.id === this.customerData.planDuration);
    }

    // Get selected payment status details
    getSelectedPaymentStatus() {
        return this.paymentOptions.find(payment => payment.id === this.customerData.paymentStatus);
    }
} 