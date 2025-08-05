import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';

@Component({
    selector: 'app-add-customer',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './add-customer.html',
    styleUrl: './add-customer.css'
})
export class AddCustomerComponent {
    customerForm!: FormGroup;
    admins: any;

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

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private systemService: SystemService
    ) {
        this.customerForm = this.fb.group({

        })
    }

    ngOnInit() {
        this.initForm();
        this.systemService.getAllAdmins().subscribe((res) => {
            this.admins = res.admins;
        });
    }

    initForm() {
        this.customerForm = this.fb.group({
            serial_number: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
            customer_name: ['', [Validators.required, Validators.minLength(2)]],
            address: [''],
            phone: [''],
            plan_id: ['1', Validators.required],
            payment_status: ['paid', Validators.required],
            admin_id: ['', Validators.required]
        });
    }

    // Validation helper methods
    isFieldInvalid(fieldName: string): boolean {
        const field = this.customerForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    getErrorMessage(fieldName: string): string {
        const field = this.customerForm.get(fieldName);
        if (!field) return '';

        if (field.hasError('required')) {
            return `${this.getFieldLabel(fieldName)} is required`;
        }
        if (field.hasError('minlength')) {
            const requiredLength = field.errors?.['minlength']?.requiredLength;
            return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
        }
        if (field.hasError('maxlength')) {
            const requiredLength = field.errors?.['maxlength']?.requiredLength;
            return `${this.getFieldLabel(fieldName)} must be exactly ${requiredLength} characters`;
        }
        return '';
    }

    getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            serialNumber: 'Serial Number',
            customerName: 'Customer Name',
            address: 'Address',
            phone: 'Phone',
            planDuration: 'Plan Duration',
            paymentStatus: 'Payment Status',
            adminId: 'Admin'
        };
        return labels[fieldName] || fieldName;
    }

    // Plan selection
    selectPlan(planId: string): void {
        this.customerForm.patchValue({ planDuration: planId });
    }

    // Payment status selection
    selectPaymentStatus(status: string): void {
        this.customerForm.patchValue({ paymentStatus: status });
    }

    // Form submission
    onSubmit(): void {
        if (this.customerForm.valid) {
            const data = this.customerForm.value;
            console.log('Saving customer:', this.customerForm.value);
            // Here you would typically make an API call to save the customer
            this.systemService.addCustomer(data).subscribe((res) => {
                alert('Customer saved successfully!');
                this.router.navigate(['/customers']);
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    // Mark all form controls as touched to trigger validation display
    markFormGroupTouched() {
        Object.keys(this.customerForm.controls).forEach(key => {
            const control = this.customerForm.get(key);
            control?.markAsTouched();
        });
    }

    // Cancel form
    cancelForm(): void {
        this.router.navigate(['/customers']);
    }

    // Check if plan is selected
    isPlanSelected(planId: string): boolean {
        return this.customerForm.get('planDuration')?.value === planId;
    }

    // Check if payment status is selected
    isPaymentSelected(status: string): boolean {
        return this.customerForm.get('paymentStatus')?.value === status;
    }

    // Get selected plan details
    getSelectedPlan() {
        const planId = this.customerForm.get('planDuration')?.value;
        return this.planOptions.find(plan => plan.id === planId);
    }

    // Get selected payment status details
    getSelectedPaymentStatus() {
        const statusId = this.customerForm.get('paymentStatus')?.value;
        return this.paymentOptions.find(payment => payment.id === statusId);
    }
} 