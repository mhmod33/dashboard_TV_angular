import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { AuthServiceService } from '../services/auth-service/auth-service.service';
import { Period } from '../interfaces/period';

@Component({
  selector: 'app-edit-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.css',
})
export class EditCustomerComponent {
  customerForm!: FormGroup;
  admins: any;
  role: any;
  isSubmitting = false;
  customerId: string = '';
  isLoadingPlans = false;

  // Plan options - now loaded dynamically
  planOptions: any[] = [];

  // Payment status options
  paymentOptions = [
    { id: 'unpaid', name: 'Unpaid' },
    { id: 'paid', name: 'Paid' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private systemService: SystemService,
    private authService: AuthServiceService
  ) {
    this.role = this.authService.getRole();
    this.initForm();
  }

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id') || '';
    console.log('Editing customer with ID:', this.customerId);

    // Load plans first
    this.loadPlans();

    if (this.customerId) {
      this.loadCustomerData();
    } else {
      console.error('No customer ID provided');
      this.router.navigate(['/customers']);
    }

    // Only load admins if not subadmin
    if (this.role !== 'subadmin') {
      this.systemService.getAllAdmins().subscribe({
        next: (res) => {
          this.admins = res.admins;
        },
        error: (error) => {
          console.error('Error loading admins:', error);
        },
      });
    }
  }

// In edit-customer.ts
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
      this.planOptions = [];
    }
  });
}

  loadCustomerData() {
    if (this.customerId.startsWith('temp-')) {
      console.error('Cannot load customer with temporary ID');
      this.router.navigate(['/customers']);
      return;
    }

    this.systemService.getCustomerById(this.customerId).subscribe({
      next: (customer: Customer) => {
        if (customer) {
          this.customerForm.patchValue({
            serial_number: customer.serial_number,
            customer_name: customer.name || customer.customer_name,
            address: customer.address,
            phone: customer.phone,
            plan_id: String(customer.plan_id),
            payment_status: customer.payment_status,
            admin_id: customer.admin_id ? String(customer.admin_id) : '',
          });
        } else {
          console.error('Customer data not found');
          this.router.navigate(['/customers']);
        }
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.router.navigate(['/customers']);
      },
    });
  }

  initForm() {
    this.customerForm = this.fb.group({
      serial_number: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
        ],
      ],
      customer_name: ['', [Validators.required, Validators.minLength(2)]],
      address: [''],
      phone: [''],
      plan_id: ['1', Validators.required],
      payment_status: ['paid', Validators.required],
      admin_id: [''],
    });

    // Add admin validation based on role
    if (this.role !== 'subadmin') {
      this.customerForm.get('admin_id')?.setValidators([Validators.required]);
    }
  }

  validateSerialNumber(): void {
    const serialNumber = this.customerForm.get('serial_number')?.value;
    const validChars = /^[A-F0-9]+$/;

    // First check for valid characters
    if (serialNumber && !validChars.test(serialNumber)) {
      this.customerForm.get('serial_number')?.setErrors({ invalidChars: true });
      return;
    }

    // Then check length and existence (your existing code)
    if (serialNumber && serialNumber.length === 12) {
      this.systemService
        .getCustomerBysn({ serial_number: serialNumber })
        .subscribe({
          next: (response: any) => {
            if (response.customer && response.customer.id !== this.customerId) {
              this.customerForm
                .get('serial_number')
                ?.setErrors({ snExists: true });
            }
          },
          error: (error: any) => {
            console.error('Error checking serial number:', error);
          },
        });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(
        fieldName
      )} must be at least ${requiredLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const requiredLength = field.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(
        fieldName
      )} must be exactly ${requiredLength} characters`;
    }
    if (field.hasError('snExists')) {
      return 'This Serial Number is already in use';
    }
    if (field.hasError('invalidChars')) {
      return 'Serial Number must contain only uppercase letters A-F and numbers (0-9)';
    }
    return '';
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      serial_number: 'Serial Number',
      customer_name: 'Customer Name',
      address: 'Address',
      phone: 'Phone',
      plan_id: 'Plan Duration',
      payment_status: 'Payment Status',
      admin_id: 'Admin',
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

  onSubmit(): void {
    if (this.customerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // Prepare the data for the backend
      const formData = this.customerForm.value;
      const data = {
        serial_number: formData.serial_number,
        customer_name: formData.customer_name,
        address: formData.address,
        phone: formData.phone,
        plan_id: Number(formData.plan_id), // Ensure it's a number
        admin_id: Number(formData.admin_id), // Convert to number if backend expects it
        payment_status: formData.payment_status,
      };

      this.systemService.updateCustomer(this.customerId, data).subscribe({
        next: (res) => {
          alert('Customer updated successfully!');
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          console.error('Full error object:', error);
          let errorMsg = 'Error updating customer.';
          if (error.error) {
            errorMsg += ` Server says: ${
              error.error.message || JSON.stringify(error.error)
            }`;
          }
          alert(errorMsg);
          this.isSubmitting = false;
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Mark all form controls as touched to trigger validation display
  markFormGroupTouched() {
    Object.keys(this.customerForm.controls).forEach((key) => {
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
}
