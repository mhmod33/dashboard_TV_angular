import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-time-periods',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './time-periods.component.html',
  styleUrl: './time-periods.component.css'
})
export class TimePeriodsComponent {
  timePeriodForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.timePeriodForm = this.fb.group({
      periodCode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      displayName: ['', [Validators.required]],
      months: ['', [Validators.required, Validators.min(1)]],
      days: ['', [Validators.required, Validators.min(1)]],
      displayOrder: [5, [Validators.required, Validators.min(1)]],
      active: [true]
    });
  }

  addPeriod() {
    if (this.timePeriodForm.valid) {
      console.log('Adding new time period:', this.timePeriodForm.value);
      // Here you would typically make an API call to save the time period
      alert('Time period added successfully!');
      this.resetForm();
    } else {
      alert('Please check the form for errors.');
    }
  }

  resetForm() {
    this.timePeriodForm.patchValue({
      periodCode: '',
      displayName: '',
      months: '',
      days: '',
      displayOrder: 5,
      active: true
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.timePeriodForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['pattern']) {
        return 'Invalid format';
      }
      if (control.errors['min']) {
        return 'Value must be greater than 0';
      }
    }
    return '';
  }
}
