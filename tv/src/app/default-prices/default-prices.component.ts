import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-default-prices',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './default-prices.component.html',
  styleUrl: './default-prices.component.css'
})
export class DefaultPricesComponent {
  pricesForm: FormGroup;
  
  priceConfigurations = [
    {
      id: 1,
      duration: '1 Month',
      months: 1,
      days: 30,
      price: 120000,
      description: '1 month(s) / 30 day(s)'
    },
    {
      id: 2,
      duration: '3 Months',
      months: 3,
      days: 90,
      price: 120,
      description: '3 month(s) / 90 day(s)'
    },
    {
      id: 3,
      duration: '6 Months',
      months: 6,
      days: 180,
      price: 1600000,
      description: '6 month(s) / 180 day(s)'
    },
    {
      id: 4,
      duration: '12 Months',
      months: 12,
      days: 365,
      price: 3200000,
      description: '12 month(s) / 365 day(s)'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.pricesForm = this.fb.group({
      price1: [120000, [Validators.required, Validators.min(0)]],
      price2: [120, [Validators.required, Validators.min(0)]],
      price3: [1600000, [Validators.required, Validators.min(0)]],
      price4: [3200000, [Validators.required, Validators.min(0)]]
    });
  }

  saveChanges() {
    if (this.pricesForm.valid) {
      console.log('Saving price changes:', this.pricesForm.value);
      // Here you would typically make an API call to save the changes
      alert('Price changes saved successfully!');
    } else {
      alert('Please check the form for errors.');
    }
  }

  cancel() {
    // Reset form to original values
    this.pricesForm.patchValue({
      price1: 120000,
      price2: 120,
      price3: 1600000,
      price4: 3200000
    });
    console.log('Changes cancelled');
  }
}
