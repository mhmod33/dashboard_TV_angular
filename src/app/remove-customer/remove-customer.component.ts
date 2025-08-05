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
  deleteCustomer(id: number) {
    return this.systemService.deleteCustomer(id).subscribe(() => {
      alert('deleted successfully!');
    })
  }
  searchCustomer() {

    if (this.removeForm.valid) {
      const data = this.removeForm.value
      this.systemService.getCustomerBysn(data).subscribe({
        next: (res) => {
          this.customer = res.customer
        },
        error: () => {
          alert('There is no customer with this sn 🚨🚫')
        }
      }
      )
    } else {
      alert('Please enter a valid device serial number.');
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
