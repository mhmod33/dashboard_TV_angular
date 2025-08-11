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
  
  // Modal properties
  showModal: boolean = false;
  modalType: 'info' | 'confirm' = 'info';
  modalTitle: string = '';
  modalMessage: string = '';
  modalAction: (() => void) | null = null;

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

  // Modal methods
  showInfoModal(message: string) {
    this.showModal = true;
    this.modalType = 'info';
    this.modalTitle = 'Notification';
    this.modalMessage = message;
    this.modalAction = null;
  }

  showConfirmModal(message: string, action: () => void) {
    this.showModal = true;
    this.modalType = 'confirm';
    this.modalTitle = 'Confirmation';
    this.modalMessage = message;
    this.modalAction = action;
  }

  closeModal() {
    this.showModal = false;
    this.modalAction = null;
  }

  confirmModal() {
    if (this.modalAction) {
      this.showModal = false;
      this.modalAction();
      this.modalAction = null;
    }
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
        this.showInfoModal('Cannot decrease more than current balance');
        this.isSubmitting = false;
        return;
      }

      // Get current user role
      const currentUserRole = localStorage.getItem('role');
      const currentUserId = localStorage.getItem('id');
      
      // Show confirmation message based on role and action
      let confirmMessage = '';
      
      if (currentUserRole === 'superadmin') {
        if (action === 'increase') {
          if (this.admin.role === 'admin') {
            confirmMessage = `This will decrease your balance by ${changeAmount}. Continue?`;
          } else if (this.admin.role === 'subadmin') {
            confirmMessage = `This will decrease the parent admin's balance by ${changeAmount}. Continue?`;
          }
        } else { // decrease
          if (this.admin.role === 'admin') {
            confirmMessage = `This will increase your balance by ${changeAmount}. Continue?`;
          } else if (this.admin.role === 'subadmin') {
            confirmMessage = `This will increase the parent admin's balance by ${changeAmount}. Continue?`;
          }
        }
      } else if (currentUserRole === 'admin') {
        if (action === 'increase') {
          confirmMessage = `This will decrease your balance by ${changeAmount}. Continue?`;
        } else { // decrease
          confirmMessage = `This will increase your balance by ${changeAmount}. Continue?`;
        }
      }
      
      // If we have a confirmation message, show it
      if (confirmMessage) {
        this.showConfirmModal(confirmMessage, () => {
          this.processBalanceChange(action, data, currentBalance, changeAmount);
        });
        this.isSubmitting = false;
        return;
      }

      // If no confirmation needed, proceed directly
      this.processBalanceChange(action, data, currentBalance, changeAmount);
    } else {
      this.markFormGroupTouched();
    }
  }

  processBalanceChange(action: string, data: any, currentBalance: number, changeAmount: number): void {
    this.isSubmitting = true;
    const currentUserRole = localStorage.getItem('role');

    // Calculate new balance for the target admin
    const newBalance = action === 'increase'
      ? +(currentBalance + changeAmount).toFixed(2)
      : +(currentBalance - changeAmount).toFixed(2);

    // Update UI immediately for the target admin
    this.admin.balance = newBalance;

    if (action === 'increase') {
      this.systemService
        .updateBalance(data.admin_id, changeAmount)
        .subscribe({
          next: (res) => {
            // Handle success response
            this.isSubmitting = false;
            
            // Show success message with details
            let successMessage = 'Balance added successfully!';
            
            if (currentUserRole === 'superadmin' && this.admin.role === 'admin') {
              successMessage += ` Your balance has been decreased by ${changeAmount}.`;
            } else if (currentUserRole === 'superadmin' && this.admin.role === 'subadmin') {
              successMessage += ` The subadmin's balance has been increased by ${changeAmount} and the parent admin's balance has been decreased by ${changeAmount}.`;
            } else if (currentUserRole === 'admin') {
              successMessage += ` Your balance has been decreased by ${changeAmount}.`;
            }
            
            this.showInfoModal(successMessage);
          },
          error: (error) => {
            // Revert the balance on error
            this.admin.balance = currentBalance;
            console.error('Error adding balance:', error);
            
            // Show appropriate error message
            let errorMessage = 'Error adding balance. ';
            
            if (error.error && error.error.message) {
              errorMessage += error.error.message;
            } else {
              errorMessage += 'Please try again.';
            }
            
            this.showInfoModal(errorMessage);
            this.isSubmitting = false;
          },
        });
    } else if (action === 'decrease') {
      this.systemService
        .decreaseBalance(data.admin_id, changeAmount)
        .subscribe({
          next: (res) => {
            // Handle success response
            this.isSubmitting = false;
            
            // Show success message with details
            let successMessage = 'Balance decreased successfully!';
            
            if (currentUserRole === 'superadmin' && this.admin.role === 'admin') {
              successMessage += ` Your balance has been increased by ${changeAmount}.`;
            } else if (currentUserRole === 'superadmin' && this.admin.role === 'subadmin') {
              successMessage += ` The subadmin's balance has been decreased by ${changeAmount} and the parent admin's balance has been increased by ${changeAmount}.`;
            } else if (currentUserRole === 'admin') {
              successMessage += ` Your balance has been increased by ${changeAmount}.`;
            }
            
            this.showInfoModal(successMessage);
          },
          error: (error) => {
            // Revert the balance on error
            this.admin.balance = currentBalance;
            console.error('Error decreasing balance:', error);
            
            // Show appropriate error message
            let errorMessage = 'Error decreasing balance. ';
            
            if (error.error && error.error.message) {
              errorMessage += error.error.message;
            } else {
              errorMessage += 'Please try again.';
            }
            
            this.showInfoModal(errorMessage);
            this.isSubmitting = false;
          },
        });
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
