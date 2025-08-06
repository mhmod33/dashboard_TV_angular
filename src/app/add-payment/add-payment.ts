import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';

@Component({
    selector: 'app-add-payment',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './add-payment.html',
    styleUrl: './add-payment.css'
})
export class AddPaymentComponent {
    paymentForm!: FormGroup;
    customers: any[] = [];
    isSubmitting = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private systemService: SystemService
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadCustomers();
    }

    initForm() {
        this.paymentForm = this.fb.group({
            payment_id: ['', [Validators.required]],
            serial_number: ['', [Validators.required, Validators.minLength(12)]],
            customer_name: ['', [Validators.required]],
            owner: ['', [Validators.required]],
            exp_before: ['', [Validators.required]],
            exp_after: ['', [Validators.required]],
            cost: ['', [Validators.required, Validators.min(0)]],
            duration: ['', [Validators.required, Validators.pattern(/^(1|3|6|12)$/)]]
        });

        // Subscribe to duration changes to auto-calculate expiration dates
        this.paymentForm.get('duration')?.valueChanges.subscribe(duration => {
            this.calculateExpirationDates(duration);
        });
    }

    // Calculate expiration dates based on duration
    calculateExpirationDates(duration: number) {
        if (!duration) return;

        const today = new Date();

        // Set exp_before to today
        const expBefore = today.toISOString().split('T')[0];

        // Calculate exp_after by adding months
        const expAfter = new Date(today);
        expAfter.setMonth(expAfter.getMonth() + Number(duration));

        this.paymentForm.patchValue({
            exp_before: expBefore,
            exp_after: expAfter.toISOString().split('T')[0]
        });
    }

    loadCustomers() {
        this.systemService.allSuperCustomers().subscribe({
            next: (res: any) => {
                this.customers = res.customers || [];
            },
            error: (error) => {
                console.error('Error loading customers:', error);
            }
        });
    }

    // Validation helper methods
    isFieldInvalid(fieldName: string): boolean {
        const field = this.paymentForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    getErrorMessage(fieldName: string): string {
        const field = this.paymentForm.get(fieldName);
        if (!field) return '';

        if (field.hasError('required')) {
            return `${this.getFieldLabel(fieldName)} is required`;
        }
        if (field.hasError('min')) {
            return `${this.getFieldLabel(fieldName)} must be greater than 0`;
        }
        if (field.hasError('minlength')) {
            return `${this.getFieldLabel(fieldName)} must be at least 12 characters`;
        }
        if (field.hasError('pattern')) {
            return `${this.getFieldLabel(fieldName)} must be 1, 3, 6, or 12 months`;
        }
        return '';
    }

    getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            payment_id: 'Payment ID',
            serial_number: 'Serial Number',
            customer_name: 'Customer Name',
            owner: 'Owner',
            exp_before: 'Expiration Before',
            exp_after: 'Expiration After',
            cost: 'Cost',
            duration: 'Duration'
        };
        return labels[fieldName] || fieldName;
    }

    // Form submission
    onSubmit(): void {
        if (this.paymentForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const data = this.paymentForm.value;
            console.log('Saving payment:', data);

            this.systemService.addPayment(data).subscribe({
                next: (res) => {
                    alert('Payment added successfully!');
                    this.router.navigate(['/payment-history']);
                },
                error: (error) => {
                    console.error('Error adding payment:', error);
                    alert('Error adding payment. Please try again.');
                    this.isSubmitting = false;
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    // Mark all form controls as touched to trigger validation display
    markFormGroupTouched() {
        Object.keys(this.paymentForm.controls).forEach(key => {
            const control = this.paymentForm.get(key);
            control?.markAsTouched();
        });
    }

    // Cancel form
    cancelForm(): void {
        this.router.navigate(['/payment-history']);
    }

    // Auto-fill customer details when serial number is selected
    onCustomerSelect(event: any): void {
        const selectedValue = event.target.value;
        if (selectedValue) {
            const customer = this.customers.find(c => c.id == selectedValue);
            if (customer) {
                this.paymentForm.patchValue({
                    serial_number: customer.serial_number,
                    customer_name: customer.name,
                    owner: customer.owner || 'Admin'
                });
            }
        }
    }
} 