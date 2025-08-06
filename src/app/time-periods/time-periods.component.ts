import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemService } from '../services/system/system.service';
import { Period } from '../interfaces/period';

@Component({
  selector: 'app-time-periods',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './time-periods.component.html',
  styleUrl: './time-periods.component.css'
})
export class TimePeriodsComponent {
  timePeriodForm: FormGroup;
  loading = false;
  error: string = '';
  success: string = '';

  constructor(private fb: FormBuilder, private systemService: SystemService) {
    this.timePeriodForm = this.fb.group({
      period_code: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      display_name: ['', [Validators.required]],
      months: ['', [Validators.required, Validators.min(1)]],
      days: ['', [Validators.required, Validators.min(1)]],
      display_order: [5, [Validators.required, Validators.min(1)]],
      active: [true]
    });
  }

  addPeriod() {
    this.error = '';
    this.success = '';
    if (this.timePeriodForm.valid) {
      this.loading = true;
      this.systemService.addPeriod(this.timePeriodForm.value).subscribe({
        next: () => {
          this.success = 'Time period added successfully!';
          this.resetForm();
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to add period.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Please check the form for errors.';
    }
  }

  resetForm() {
    this.timePeriodForm.reset({
      period_code: '',
      display_name: '',
      months: '',
      days: '',
      display_order: 5,
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
