import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-admin.html',
    styleUrl: './add-admin.css'
})
export class AddAdminComponent {
    // Form data
    adminData = {
        username: '',
        password: '',
        balance: '',
        userType: 'superadmin'
    };

    // Validation states
    errors = {
        username: '',
        password: '',
        balance: ''
    };

    // User type options
    userTypes = [
        { id: 'superadmin', name: 'Super Admin' },
        { id: 'admin', name: 'Admin' },
        { id: 'subadmin', name: 'Sub Admin' }
    ];

    constructor(private router: Router) { }

    // Validation methods
    validateUsername(): boolean {
        if (!this.adminData.username.trim()) {
            this.errors.username = 'Username is required';
            return false;
        }
        if (this.adminData.username.length < 3) {
            this.errors.username = 'Username must be at least 3 characters';
            return false;
        }
        this.errors.username = '';
        return true;
    }

    validatePassword(): boolean {
        if (!this.adminData.password) {
            this.errors.password = 'Password is required';
            return false;
        }
        if (this.adminData.password.length < 6) {
            this.errors.password = 'Password must be at least 6 characters';
            return false;
        }
        this.errors.password = '';
        return true;
    }

    validateBalance(): boolean {
        if (!this.adminData.balance) {
            this.errors.balance = 'Balance is required';
            return false;
        }
        const balanceNum = parseFloat(this.adminData.balance);
        if (isNaN(balanceNum) || balanceNum < 0) {
            this.errors.balance = 'Balance must be a valid positive number';
            return false;
        }
        this.errors.balance = '';
        return true;
    }

    validateForm(): boolean {
        const isUsernameValid = this.validateUsername();
        const isPasswordValid = this.validatePassword();
        const isBalanceValid = this.validateBalance();
        return isUsernameValid && isPasswordValid && isBalanceValid;
    }

    // User type selection
    selectUserType(userType: string): void {
        this.adminData.userType = userType;
    }

    // Form submission
    saveAdmin(): void {
        if (this.validateForm()) {
            console.log('Saving admin:', this.adminData);
            // Here you would typically make an API call to save the admin
            alert('Admin user saved successfully!');
            this.router.navigate(['/admin-users']);
        }
    }

    // Cancel form
    cancelForm(): void {
        this.router.navigate(['/admin-users']);
    }

    // Check if user type is selected
    isUserTypeSelected(userType: string): boolean {
        return this.adminData.userType === userType;
    }

    // Get selected user type details
    getSelectedUserType() {
        return this.userTypes.find(type => type.id === this.adminData.userType);
    }
} 