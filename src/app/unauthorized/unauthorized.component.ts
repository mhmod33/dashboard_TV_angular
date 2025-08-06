import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p class="role-info">Your current role: <strong>{{ currentRole | titlecase }}</strong></p>
        <button class="back-btn" (click)="goBack()">Go Back</button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8fafc;
      padding: 20px;
    }

    .unauthorized-content {
      text-align: center;
      max-width: 400px;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .error-icon {
      color: #ef4444;
      margin-bottom: 24px;
    }

    h1 {
      color: #1f2937;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    p {
      color: #6b7280;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .role-info {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .back-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .back-btn:hover {
      background: #2563eb;
    }
  `]
})
export class UnauthorizedComponent {
  currentRole: string = '';

  constructor(private router: Router) {
    this.currentRole = localStorage.getItem('role') || 'unknown';
  }

  goBack() {
    this.router.navigate(['/home']);
  }
} 