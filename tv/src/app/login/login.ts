import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../services/auth-service/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  loginForm: FormGroup;
  passwordValidationMessage = ''
  constructor(
    private fb: FormBuilder,
    private authService: AuthServiceService,
    private router: Router,
  ) {

    this.loginForm = fb.group({
      email: ['', Validators.email, Validators.required],
      password: ['', Validators.required, Validators.minLength(3)]
    })
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
        this.passwordValidationMessage = 'Password must be at least 3 characters';
      }
    } else {
      this.passwordValidationMessage = '';
    }
  }
  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value

      this.authService.login(email, password).subscribe({
        next: () => {
          this.isLoading= false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;
          this.passwordValidationMessage = err?.error?.Message || 'Login failed. Please check your credentials.';
        }
      })
    // Simulate API call
    // setTimeout(() => {
    //   this.isLoading = false;
    //   // For demo purposes, accept any valid email/password
    //   if (this.email.includes('@') && this.password.length >= 6) {
    //     this.router.navigate(['/home']);
    //   } else {
    //     alert('Invalid credentials. Please try again.');
    //   }
    // }, 1500);
  }
}
}
