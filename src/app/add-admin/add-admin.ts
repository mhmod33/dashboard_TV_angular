import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutComponent } from '../layout/layout';
import { SystemService } from '../services/system/system.service';
import { ModalService } from '../services/modal.service';

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
        name: '',
        password: '',
        balance: '',
        role: 'superadmin'
    };

    // Validation states
    errors = {
        name: '',
        password: '',
        balance: ''
    };

    // User type options
    userTypes = [
        { id: 'superadmin', name: 'superadmin' },
        { id: 'admin', name: 'Admin' },
        { id: 'subadmin', name: 'Sub Admin' }
    ];

    constructor(
        private router: Router,
        private systemService: SystemService,
        private modalService: ModalService
    ) { }

    // Validation methods
    validateUsername(): boolean {
        if (!this.adminData.name.trim()) {
            this.errors.name = 'name is required';
            return false;
        }
        if (this.adminData.name.length < 3) {
            this.errors.name = 'name must be at least 3 characters';
            return false;
        }
        this.errors.name = '';
        return true;
    }

    validatePassword(): boolean {
        if (!this.adminData.password) {
            this.errors.password = 'Password is required';
            return false;
        }
        if (this.adminData.password.length < 3) {
            this.errors.password = 'Password must be at least 3 characters';
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
    selectUserType(role: string): void {
        this.adminData.role = role;
    }

    // Form submission
    saveAdmin(): void {
        if (this.validateForm()) {
            console.log('Saving admin:', this.adminData);
            this.systemService.addAdmin(this.adminData).subscribe((res) => {
                this.modalService.showSuccessMessage('Admin user saved successfully!');
            })
            this.router.navigate(['/admin-users']);
        }
    }

    // Cancel form
    cancelForm(): void {
        this.router.navigate(['/admin-users']);
    }

    // Check if user type is selected
    isUserTypeSelected(role: string): boolean {
        return this.adminData.role === role;
    }

    // Get selected user type details
    getSelectedUserType() {
        return this.userTypes.find(type => type.id === this.adminData.role);
    }
} 