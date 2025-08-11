import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../services/auth-service/auth-service.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  name: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  loginForm: FormGroup;
  passwordValidationMessage = '';
  showInactiveModal = false;
  inactiveUsername = '';
  supportEmail = 'support@egybest-tv.com';

  constructor(
    private fb: FormBuilder,
    private authService: AuthServiceService,
    private router: Router,
    private modalService: ModalService
  ) {
    this.loginForm = fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  validatePassword() {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.errors) {
      if (passwordControl.errors['required']) {
        this.passwordValidationMessage = 'Password is required';
      } else if (passwordControl.errors['minLength']) {
        this.passwordValidationMessage =
          'Password must be at least 3 characters';
      }
    } else {
      this.passwordValidationMessage = '';
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { name, password } = this.loginForm.value;
      this.inactiveUsername = name; // Store username for reference in inactive modal

      this.authService.login(name, password).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.status === 'active') {
            this.router.navigate(['/home']);
          } else {
            this.showInactiveModal = true;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.passwordValidationMessage =
            err?.error?.message ||
            'Login failed. Please check your credentials.';
        },
      });
    }
  }

  closeInactiveModal() {
    this.showInactiveModal = false;
  }

  /**
   * Handles the contact admin action from the inactive account modal
   * In a real application, this would send a support request or open an email client
   */
  contactAdmin(): void {
    // Simulate sending a support request
    const username = this.inactiveUsername || this.loginForm.get('name')?.value;
    
    // Show a more detailed confirmation with a timeout to simulate processing
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.modalService.showInfoMessage(`A support request has been sent for account: ${username}\n\nOur team will review your account status and contact you shortly.`);
      this.closeInactiveModal();
    }, 1500);
  }
  
  /**
   * Opens the default email client with a pre-filled support email
   */
  openEmailClient(): void {
    const username = this.inactiveUsername || this.loginForm.get('name')?.value;
    const subject = encodeURIComponent(`Account Activation Request - ${username}`);
    const body = encodeURIComponent(
      `Hello Support Team,\n\nI'm trying to access my account (${username}) but it appears to be inactive.\n\nPlease activate my account or provide further instructions.\n\nThank you.`
    );
    
    window.location.href = `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
  }
}