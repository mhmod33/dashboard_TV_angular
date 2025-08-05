import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-remove-customer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './remove-customer.component.html',
  styleUrl: './remove-customer.component.css'
})
export class RemoveCustomerComponent {
  removeForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.removeForm = this.fb.group({
      deviceSN: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  searchCustomer() {
    if (this.removeForm.valid) {
      console.log('Searching for customer with SN:', this.removeForm.value.deviceSN);
      // Here you would typically make an API call to search for the customer
      alert('Searching for customer...');
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
        return 'Device SN must be at least 3 characters';
      }
    }
    return '';
  }
}
