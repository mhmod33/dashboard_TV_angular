import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { LayoutComponent } from '../layout/layout';

@Component({
    selector: 'app-edit-admin',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
    templateUrl: './edit-admin.html',
    styleUrl: './edit-admin.css'
})
export class EditAdminComponent implements OnInit {
    adminId: string = '';
    adminForm!: FormGroup;
    isSubmitting = false;
    admin: any = null;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public router: Router, // CHANGED: public for template access
        private systemService: SystemService
    ) { }

    ngOnInit() {
        this.adminId = String(this.route.snapshot.paramMap.get('id'));
        this.initForm();
        this.loadAdmin();
    }

    initForm() {
        this.adminForm = this.fb.group({
            name: ['', Validators.required],
            password: ['', [Validators.minLength(3)]],
            status: ['', Validators.required],
            balance: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
            role: ['', Validators.required]
        });
    }

    loadAdmin() {
        this.systemService.getAdminById(this.adminId).subscribe({
            next: (res: any) => {
                this.admin = res.admin;
                this.adminForm.patchValue({
                    name: this.admin.name,
                    status: this.admin.status,
                    balance: this.admin.balance,
                    role: this.admin.role
                });
            }
        });
    }

    onSubmit() {
        if (this.adminForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const data = this.adminForm.value;
            // Only send password if changed
            if (!data.password) delete data.password;
            this.systemService.updateAdmin(this.adminId, data).subscribe({
                next: (res) => {
                    alert('Admin updated successfully!');
                    this.router.navigate(['/admin-users']);
                },
                error: (err) => {
                    alert('Error updating admin.');
                    this.isSubmitting = false;
                }
            });
        } else {
            Object.values(this.adminForm.controls).forEach(control => control.markAsTouched());
        }
    }
}