import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-delete-all-customers',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delete-all-customers.component.html',
  styleUrl: './delete-all-customers.component.css'
})
export class DeleteAllCustomersComponent {
  deleteForm: FormGroup;
  showConfirmation = false;
  
  constructor(private fb: FormBuilder) {
    this.deleteForm = this.fb.group({
      confirmationText: ['', [Validators.required, Validators.pattern(/^DELETE ALL CUSTOMERS$/)]]
    });
  }

  showDeleteConfirmation() {
    this.showConfirmation = true;
  }

  cancelDelete() {
    this.showConfirmation = false;
    this.deleteForm.reset();
  }

  confirmDeleteAll() {
    if (this.deleteForm.valid) {
      console.log('Deleting all customers...');
      // Here you would typically make an API call to delete all customers
      alert('All customers have been deleted successfully!');
      this.showConfirmation = false;
      this.deleteForm.reset();
    } else {
      alert('Please type "DELETE ALL CUSTOMERS" exactly to confirm.');
    }
  }

  getErrorMessage(): string {
    const control = this.deleteForm.get('confirmationText');
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'Confirmation text is required';
      }
      if (control.errors['pattern']) {
        return 'Please type "DELETE ALL CUSTOMERS" exactly';
      }
    }
    return '';
  }
}
