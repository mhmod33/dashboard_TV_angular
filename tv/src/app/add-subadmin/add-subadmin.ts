import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-subadmin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-subadmin.html',
    styleUrl: './add-subadmin.css'
})
export class AddSubAdminComponent {
    // Form data
    subAdminData = {
        username: '',
        password: '',
        fullName: '',
        initialBalance: '0'
    };

    // Validation states
    errors = {
        username: '',
        password: '',
        fullName: '',
        initialBalance: ''
    };

    // Available balance
    availableBalance = 0;

    constructor(private router: Router) { }

    // Validation methods
    validateUsername(): boolean {
        if (!this.subAdminData.username.trim()) {
            this.errors.username = 'Username is required';
            return false;
        }
        if (this.subAdminData.username.length < 3) {
            this.errors.username = 'Username must be at least 3 characters';
            return false;
        }
        this.errors.username = '';
        return true;
    }

    validatePassword(): boolean {
        if (!this.subAdminData.password) {
            this.errors.password = 'Password is required';
            return false;
        }
        if (this.subAdminData.password.length < 6) {
            this.errors.password = 'Password must be at least 6 characters';
            return false;
        }
        this.errors.password = '';
        return true;
    }

    validateFullName(): boolean {
        if (!this.subAdminData.fullName.trim()) {
            this.errors.fullName = 'Full name is required';
            return false;
        }
        this.errors.fullName = '';
        return true;
    }

    validateInitialBalance(): boolean {
        if (!this.subAdminData.initialBalance) {
            this.errors.initialBalance = 'Initial balance is required';
            return false;
        }
        const balanceNum = parseFloat(this.subAdminData.initialBalance);
        if (isNaN(balanceNum) || balanceNum < 0) {
            this.errors.initialBalance = 'Initial balance must be a valid positive number';
            return false;
        }
        if (balanceNum > this.availableBalance) {
            this.errors.initialBalance = 'Initial balance cannot exceed available balance';
            return false;
        }
        this.errors.initialBalance = '';
        return true;
    }

    validateForm(): boolean {
        const isUsernameValid = this.validateUsername();
        const isPasswordValid = this.validatePassword();
        const isFullNameValid = this.validateFullName();
        const isBalanceValid = this.validateInitialBalance();
        return isUsernameValid && isPasswordValid && isFullNameValid && isBalanceValid;
    }

    // Form submission
    addSubAdmin(): void {
        if (this.validateForm()) {
            console.log('Adding sub-admin:', this.subAdminData);
            // Here you would typically make an API call to add the sub-admin
            alert('Sub-admin added successfully!');
            this.router.navigate(['/subadmin']);
        }
    }

    // Cancel form
    cancelForm(): void {
        this.router.navigate(['/subadmin']);
    }
} 