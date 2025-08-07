import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SystemService } from '../services/system/system.service';
import { Period } from '../interfaces/period';

@Component({
  selector: 'app-default-prices',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './default-prices.component.html',
  styleUrl: './default-prices.component.css',
})
export class DefaultPricesComponent implements OnInit {
  periods: Period[] = [];
  loading = false;
  error: string = '';
  editingId: number | null = null;
  editPrice: number | null = null;
  success: string = '';

  constructor(private systemService: SystemService) {}

  ngOnInit(): void {
    this.loadPeriods();
  }

  loadPeriods() {
    this.loading = true;
    this.systemService.getAllPeriods().subscribe({
      next: (res) => {
        this.periods = res.periods || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load periods.';
        this.loading = false;
      },
    });
  }

  startEdit(period: Period) {
    this.editingId = period.id;
    this.editPrice = period.price || 0;
    this.success = '';
    this.error = '';
  }

  saveEdit(period: Period) {
    if (this.editPrice == null || isNaN(this.editPrice)) {
      this.error = 'Please enter a valid price.';
      return;
    }

    this.loading = true;
    // Include both price and plan fields in the update data
    // The plan field is required by the backend API
    const updateData = { 
      price: this.editPrice,
      plan: period.plan || this.editPrice // Use existing plan value or default to price value
    };

    this.systemService
      .updatePeriod(period.id.toString(), updateData)
      .subscribe({
        next: () => {
          this.success = 'Price updated successfully!';
          this.editingId = null;
          this.editPrice = null;
          this.loadPeriods();
          this.loading = false;
        },
        error: (err) => {
          this.error =
            err.error?.message || 'Failed to update price. Please try again.';
          if (err.status === 401) {
            this.error = 'Session expired. Please login again.';
          }
          this.loading = false;
          console.error('Error details:', err);
        },
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.editPrice = null;
    this.error = '';
    this.success = '';
  }
}
