import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { ModalService } from '../services/modal.service';

@Component({
    selector: 'app-add-subadmin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-subadmin.html',
    styleUrl: './add-subadmin.css'
})
export class AddSubAdminComponent implements OnInit {
    // Form data
    subAdminData = {
        name: '',
        password: '',
        status: 'active',
        balance: '',
        role: 'subadmin',
        parent_admin_id: ''
    };

    // Admin list
    adminList: any[] = [];
    selectedAdminBalance: number = 0;
    isAdmin: boolean = false;

    // Validation states
    errors = {
        name: '',
        password: '',
        status: '',
        balance: '',
        role: '',
        parent_admin_id: ''
    };

    // Available balance
    availableBalance = 0;

    constructor(
        private router: Router,
        private systemService: SystemService,
        private modalService: ModalService
    ) { }

    ngOnInit(): void {
        const userRole = localStorage.getItem('role');
        this.isAdmin = userRole === 'admin';

        if (this.isAdmin) {
            // If user is admin, set parent_admin_id from localStorage and load their balance
            const adminId = localStorage.getItem('id');
            if (adminId) {
                this.subAdminData.parent_admin_id = adminId;
                this.loadAdminBalance(adminId);
            }
        } else {
            // If superadmin, load all admins
            this.loadAdmins();
        }
    }

    loadAdminBalance(adminId: string): void {
        this.systemService.getAdminById(adminId).subscribe({
            next: (res: any) => {
                this.selectedAdminBalance = res.admin.balance;
                this.availableBalance = res.admin.balance;
            },
            error: (error) => {
                console.error('Error loading admin balance:', error);
            }
        });
    }

    onAdminSelect(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const selectedId = selectElement.value;

        if (selectedId) {
            this.systemService.getAdminById(selectedId).subscribe({
                next: (res: any) => {
                    this.selectedAdminBalance = res.admin.balance;
                    this.availableBalance = res.admin.balance; // Update available balance for validation
                },
                error: (error) => {
                    console.error('Error loading admin details:', error);
                }
            });
        } else {
            this.selectedAdminBalance = 0;
            this.availableBalance = 0;
        }
    }

    loadAdmins(): void {
        this.systemService.getAllAdmins().subscribe({
            next: (response: any) => {
                this.adminList = response.admins || [];
            },
            error: (error) => {
                console.error('Error loading admins:', error);
            }
        });
    }

    // loadAvailableBalance(): void {
    //     this.systemService.getAdminBalance().subscribe({
    //         next: (response: any) => {
    //             this.availableBalance = response.balance || 0;
    //         },
    //         error: (error) => {
    //             console.error('Error loading balance:', error);
    //         }
    //     });
    // }

    // Validation methods
    validateName(): boolean {
        if (!this.subAdminData.name.trim()) {
            this.errors.name = 'Name is required';
            return false;
        }
        this.errors.name = '';
        return true;
    }

    validatePassword(): boolean {
        if (!this.subAdminData.password) {
            this.errors.password = 'Password is required';
            return false;
        }
        if (this.subAdminData.password.length < 3) {
            this.errors.password = 'Password must be at least 3 characters';
            return false;
        }
        this.errors.password = '';
        return true;
    }

    validateBalance(): boolean {
        if (!this.subAdminData.balance) {
            this.errors.balance = 'Balance is required';
            return false;
        }
        const balanceNum = parseInt(this.subAdminData.balance, 10);
        if (isNaN(balanceNum) || balanceNum < 0) {
            this.errors.balance = 'Balance must be a valid positive integer';
            return false;
        }
        if (balanceNum > this.selectedAdminBalance) {
            this.errors.balance = 'Balance cannot exceed selected admin\'s balance';
            return false;
        }
        this.errors.balance = '';
        return true;
    }

    validateParentAdmin(): boolean {
        if (!this.subAdminData.parent_admin_id) {
            this.errors.parent_admin_id = 'Parent admin is required';
            return false;
        }
        this.errors.parent_admin_id = '';
        return true;
    }

    validateStatus(): boolean {
        if (!this.subAdminData.status) {
            this.errors.status = 'Status is required';
            return false;
        }
        this.errors.status = '';
        return true;
    }

    validateForm(): boolean {
        const isNameValid = this.validateName();
        const isPasswordValid = this.validatePassword();
        const isBalanceValid = this.validateBalance();
        const isStatusValid = this.validateStatus();

        // Only validate parent admin if user is superadmin
        const isParentAdminValid = this.isAdmin ? true : this.validateParentAdmin();

        return isNameValid && isPasswordValid && isBalanceValid && isParentAdminValid && isStatusValid;
    }

    // Form submission
    addSubAdmin(): void {
        if (this.validateForm()) {
            const data = {
                ...this.subAdminData,
                balance: parseInt(this.subAdminData.balance, 10)
            };

            this.systemService.addSubAdmin(data).subscribe({
                next: (response: any) => {
                    // Get the balance that was added to the subadmin
                    const addedBalance = parseInt(this.subAdminData.balance, 10);
                    
                    // Update the displayed balance for the admin
                    if (response.admin && response.admin.balance !== undefined) {
                        // Update the local balance display
                        this.selectedAdminBalance = response.admin.balance;
                        this.availableBalance = response.admin.balance;
                        
                        // Update the balance in the balance service
                        this.systemService.balanceService.updateBalance(response.admin.balance);
                        
                        this.modalService.showSuccessMessage(`Sub-admin added successfully! Your balance decreased by ${addedBalance}.`);
                    } else {
                        this.modalService.showSuccessMessage('Sub-admin added successfully!');
                    }
                    
                    this.router.navigate(['/subadmin']);
                },
                error: (error: any) => {
                    console.error('Error adding sub-admin:', error);
                    
                    // Check if the error is due to insufficient balance
                    if (error.error && error.error.message && error.error.message.includes('insufficient balance')) {
                        this.modalService.showErrorMessage('Error: You have insufficient balance to add this sub-admin.');
                    } else {
                        this.modalService.showErrorMessage('Error adding sub-admin. Please try again.');
                    }
                }
            });
        }
    }

    // Cancel form
    cancelForm(): void {
        this.router.navigate(['/subadmin']);
    }
}