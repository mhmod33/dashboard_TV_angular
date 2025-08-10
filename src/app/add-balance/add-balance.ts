import { Component, OnInit } from '@angular/core';
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
import { BalanceService } from '../services/balance/balance.service';

@Component({
  selector: 'app-add-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-balance.html',
  styleUrl: './add-balance.css',
})
export class AddBalanceComponent implements OnInit {
  balanceForm!: FormGroup;
  adminId: string = '';
  admin: any = null;
  isSubmitting = false;
  balanceAction: 'increase' | 'decrease' = 'increase'; // NEW: track action

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private systemService: SystemService,
    private balanceService: BalanceService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.adminId = String(this.route.snapshot.paramMap.get('id'));
    console.log(this.adminId);
    this.loadAdminDetails();

    // Subscribe to form value changes
    this.balanceForm.valueChanges.subscribe(values => {
      if (this.admin && values.balance && !isNaN(values.balance)) {
        const changeAmount = Number(values.balance);
        const currentBalance = Number(this.admin.balance);

        // Validate decrease amount
        if (values.action === 'decrease' && changeAmount > currentBalance) {
          this.balanceForm.get('balance')?.setErrors({ insufficientBalance: true });
          return;
        }

        const previewBalance = values.action === 'increase' 
          ? +(currentBalance + changeAmount).toFixed(2)
          : +(currentBalance - changeAmount).toFixed(2);
        // Update the preview balance in the component
        this.previewBalance = previewBalance;
      }
    });
  }

  // Add property for preview balance
  previewBalance: number | null = null;

  initForm() {
    this.balanceForm = this.fb.group({
      balance: ['', [Validators.required, Validators.min(1)]],
      action: ['increase', Validators.required], // NEW: add action to form
    });
  }

  loadAdminDetails() {
    this.systemService.getAdminById(this.adminId).subscribe({
      next: (res: any) => {
        this.admin = res.admin;
      },
      error: (error) => {
        console.error('Error loading admin details:', error);
        alert('Error loading admin details.');
      },
    });
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.balanceForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      balance: 'balance',
    };
    return labels[fieldName] || fieldName;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.balanceForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    if (field.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(
        fieldName
      )} must be at least ${requiredLength} characters`;
    }
    if (field.hasError('insufficientBalance')) {
      return 'Insufficient balance for this decrease';
    }
    return '';
  }

  onSubmit(): void {
    if (this.balanceForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const data = {
        admin_id: this.adminId,
        balance: Number(this.balanceForm.value.balance)
      };
      const action = this.balanceForm.value.action;

      // Calculate new balance before API call
      const currentBalance = Number(this.admin.balance);
      const changeAmount = Number(this.balanceForm.value.balance);

      // Additional validation for decrease
      if (action === 'decrease' && changeAmount > currentBalance) {
        alert('Cannot decrease more than current balance');
        this.isSubmitting = false;
        return;
      }

      const newBalance = action === 'increase'
        ? +(currentBalance + changeAmount).toFixed(2)
        : +(currentBalance - changeAmount).toFixed(2);

      // Update UI immediately
      this.admin.balance = newBalance;
      this.balanceService.updateBalance(newBalance);

      if (action === 'increase') {
        this.systemService
          .updateBalance(data.admin_id, changeAmount)
          .subscribe({
            next: (res) => {
              // alert('Balance added successfully!');
              this.isSubmitting = false;
            },
            error: (error) => {
              // Revert the balance on error
              this.admin.balance = currentBalance;
              this.balanceService.updateBalance(currentBalance);
              console.error('Error adding balance:', error);
              alert('Error adding balance. Please try again.');
              this.isSubmitting = false;
            },
          });
      } else if (action === 'decrease') {
        this.systemService
          .decreaseBalance(data.admin_id, changeAmount)
          .subscribe({
            next: (res) => {
              // alert('Balance decreased successfully!');
              this.isSubmitting = false;
            },
            error: (error) => {
              // Revert the balance on error
              this.admin.balance = currentBalance;
              this.balanceService.updateBalance(currentBalance);
              console.error('Error decreasing balance:', error);
              alert('Error decreasing balance. Please try again.');
              this.isSubmitting = false;
            },
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  // Mark all form controls as touched to trigger validation display
  markFormGroupTouched() {
    Object.keys(this.balanceForm.controls).forEach((key) => {
      const control = this.balanceForm.get(key);
      control?.markAsTouched();
    });
  }

  // Cancel form
  cancelForm(): void {
    this.router.navigate(['/admin-users']);
  }
}
