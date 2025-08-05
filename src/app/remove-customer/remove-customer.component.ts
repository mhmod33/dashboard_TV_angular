import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemService } from '../services/system/system.service';

@Component({
  selector: 'app-remove-customer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './remove-customer.component.html',
  styleUrl: './remove-customer.component.css'
})
export class RemoveCustomerComponent {
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'confirm' | 'info' = 'info';
  modalAction: (() => void) | null = null;
  removeForm: FormGroup;
  sn: any;
  customer: any
  constructor(
    private fb: FormBuilder,
    private systemService: SystemService
  ) {
    this.removeForm = this.fb.group({
      serial_number: ['', [Validators.required, Validators.minLength(12)]]
    });
  }
  deleteCustomer(id: string) {
    this.showModal = true;
    this.modalType = 'confirm';
    this.modalTitle = 'Delete Customer';
    this.modalMessage = 'Are you sure you want to delete this customer?';
    this.modalAction = () => {
      this.systemService.deleteCustomer(id).subscribe({
        next: () => {
          this.showInfoModal('Customer deleted successfully!');
          this.customer = null;
        },
        error: () => {
          this.showInfoModal('Error deleting customer. Please try again.');
        }
      });
    };
  }
  searchCustomer() {
    if (this.removeForm.valid) {
      const data = this.removeForm.value;
      this.systemService.getCustomerBysn(data).subscribe({
        next: (res) => {
          this.customer = res.customer;
        },
        error: () => {
          this.showInfoModal('There is no customer with this SN');
        }
      });
    } else {
      this.showInfoModal('Please enter a valid device serial number.');
    }
  }
  showInfoModal(message: string) {
    this.showModal = true;
    this.modalType = 'info';
    this.modalTitle = 'Notification';
    this.modalMessage = message;
    this.modalAction = null;
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

  getErrorMessage(): string {
    const control = this.removeForm.get('deviceSN');
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'Device SN is required';
      }
      if (control.errors['minlength']) {
        return 'Device SN must be at least 12 characters';
      }
    }
    return '';
  }
}
