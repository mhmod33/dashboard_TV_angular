import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { Period } from '../interfaces/period';

@Component({
  selector: 'app-manage-prices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-prices.html',
  styleUrl: './manage-prices.css'
})
export class ManagePricesComponent {
  adminId!: number;
  periods: Period[] = [];
  overrides: { [key: number]: { price?: number; plan?: number } } = {};
  loading = false;
  error = '';
  success = '';

  constructor(private route: ActivatedRoute, private systemService: SystemService) {}

  ngOnInit() {
    this.adminId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading = true;
    this.systemService.getAdminPeriods(this.adminId).subscribe({
      next: (periods) => {
        this.periods = periods;
        periods.forEach(p => {
          this.overrides[p.id] = { price: p.price, plan: p.plan };
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load periods';
        this.loading = false;
      }
    });
  }

  save() {
    this.error = '';
    this.success = '';
    const payload = this.periods.map(p => ({
      period_id: p.id,
      price: this.overrides[p.id]?.price,
      plan: this.overrides[p.id]?.plan,
    }));
    this.loading = true;
    this.systemService.upsertAdminPeriods(this.adminId, payload).subscribe({
      next: () => {
        this.success = 'Saved successfully';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save';
        this.loading = false;
      }
    });
  }
}


