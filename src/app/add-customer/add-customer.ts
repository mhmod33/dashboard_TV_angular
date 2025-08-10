import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { AuthServiceService } from '../services/auth-service/auth-service.service';
import { Period } from '../interfaces/period';

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
    role: any;
    isSubmitting = false;
    isCheckingSerialNumber = false;
    serialNumberStatus: 'idle' | 'checking' | 'valid' | 'invalid' = 'idle';

    // Plan options - loaded dynamically from database
    planOptions: any[] = [];
    isLoadingPlans = false;

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
        private systemService: SystemService,
        private authService: AuthServiceService,
    ) {
        this.role = this.authService.getRole();
        this.initForm();
    }

    ngOnInit() {
        // Load plans from database
        this.loadPlans();
        
        // Only load admins if not subadmin
        if (this.role !== 'subadmin') {
            this.systemService.getAllAdmins().subscribe({
                next: (res) => {
                    this.admins = res.admins;
                },
                error: (error) => {
                    console.error('Error loading admins:', error);
                }
            });
        }
        console.log('Current role:', this.role);
    }
    
    // Load plans from database
    loadPlans() {
        this.isLoadingPlans = true;
        this.systemService.getAllPeriods().subscribe({
            next: (periods: Period[]) => {
                this.planOptions = periods.map((period: Period) => ({
                    id: period.id.toString(),
                    name: period.display_name || `${period.duration_months} Month${period.duration_months > 1 ? 's' : ''}`,
                    value: period.price?.toString() || '0'
                }));
                this.isLoadingPlans = false;
                
                // Set default plan if none selected
                if (!this.customerForm.get('plan_id')?.value && this.planOptions.length > 0) {
                    this.customerForm.patchValue({ plan_id: this.planOptions[0].id });
                }
            },
            error: (error) => {
                console.error('Error loading plans:', error);
                this.isLoadingPlans = false;
                // Fallback to default plans if loading fails
                this.planOptions = [
                    { id: '1', name: '1 Month', value: '120000' },
                    { id: '3', name: '3 Months', value: '120' },
                    { id: '6', name: '6 Months', value: '1600000' },
                    { id: '12', name: '12 Months', value: '3200000' }
                ];
            }
        });
    }

    initForm() {
        this.customerForm = this.fb.group({
            serial_number: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern(/^[A-Fa-f0-9]+$/)]],
            customer_name: ['', [Validators.required, Validators.minLength(2)]],
            address: [''],
            phone: [''],
            plan_id: ['1', Validators.required],
            payment_status: ['paid', Validators.required],
            admin_id: ['']
        });

        // Add admin validation based on role
        if (this.role !== 'subadmin') {
            this.customerForm.get('admin_id')?.setValidators([Validators.required]);
        }

        // Listen to serial number changes for real-time validation
        this.customerForm.get('serial_number')?.valueChanges.subscribe(value => {
            if (value && value.length === 12 && this.customerForm.get('serial_number')?.valid) {
                this.validateSerialNumber();
            } else {
                this.serialNumberStatus = 'idle';
            }
        });
    }

    // SN validation method
    validateSerialNumber(): void {
        const serialNumber = this.customerForm.get('serial_number')?.value;
        if (serialNumber && serialNumber.length === 12 && this.customerForm.get('serial_number')?.valid) {
            this.isCheckingSerialNumber = true;
            this.serialNumberStatus = 'checking';
            
            // Call API to check if SN exists
            this.systemService.getCustomerBysn({ serial_number: serialNumber }).subscribe({
                next: (response: any) => {
                    this.isCheckingSerialNumber = false;
                    if (response.customer) {
                        this.serialNumberStatus = 'invalid';
                        this.customerForm.get('serial_number')?.setErrors({ 'snExists': true });
                    } else {
                        this.serialNumberStatus = 'valid';
                        this.customerForm.get('serial_number')?.setErrors(null);
                    }
                },
                error: (error: any) => {
                    this.isCheckingSerialNumber = false;
                    this.serialNumberStatus = 'idle';
                    console.error('Error checking serial number:', error);
                }
            });
        } else {
            this.serialNumberStatus = 'idle';
        }
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
        if (field.hasError('pattern')) {
            return `${this.getFieldLabel(fieldName)} must contain only hexadecimal characters (A-F, a-f, 0-9)`;
        }
        if (field.hasError('minlength')) {
            const requiredLength = field.errors?.['minlength']?.requiredLength;
            return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
        }
        if (field.hasError('maxlength')) {
            const requiredLength = field.errors?.['maxlength']?.requiredLength;
            return `${this.getFieldLabel(fieldName)} must be exactly ${requiredLength} characters`;
        }
        if (field.hasError('snExists')) {
            return 'This Serial Number is already in use';
        }
        return '';
    }

    getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            serial_number: 'Serial Number',
            customer_name: 'Customer Name',
            address: 'Address',
            phone: 'Phone',
            plan_id: 'Plan Duration',
            payment_status: 'Payment Status',
            admin_id: 'Admin'
        };
        return labels[fieldName] || fieldName;
    }

    // Plan selection
    selectPlan(planId: string): void {
        this.customerForm.patchValue({ plan_id: planId });
    }

    // Payment status selection
    selectPaymentStatus(status: string): void {
        this.customerForm.patchValue({ payment_status: status });
    }

    // Form submission
    onSubmit(): void {
        if (this.customerForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const data = this.customerForm.value;
            console.log('Saving customer:', data);

            if (this.role === 'subadmin') {
                this.systemService.addMyCustomer(data).subscribe({
                    next: (res) => {
                        alert('Customer saved successfully!');
                        this.router.navigate(['/customers']);
                    },
                    error: (error) => {
                        console.error('Error saving customer:', error);
                        alert('Error saving customer. Please try again.');
                        this.isSubmitting = false;
                    }
                });
            } else {
                this.systemService.addCustomer(data).subscribe({
                    next: (res) => {
                        alert('Customer saved successfully!');
                        this.router.navigate(['/customers']);
                    },
                    error: (error) => {
                        console.error('Error saving customer:', error);
                        alert('Error saving customer. Please try again.');
                        this.isSubmitting = false;
                    }
                });
            }
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
        return this.customerForm.get('plan_id')?.value === planId;
    }

    // Check if payment status is selected
    isPaymentSelected(status: string): boolean {
        return this.customerForm.get('payment_status')?.value === status;
    }

    // Get selected plan details
    getSelectedPlan() {
        const planId = this.customerForm.get('plan_id')?.value;
        return this.planOptions.find(plan => plan.id === planId);
    }

    // Get selected payment status details
    getSelectedPaymentStatus() {
        const statusId = this.customerForm.get('payment_status')?.value;
        return this.paymentOptions.find(payment => payment.id === statusId);
    }
}