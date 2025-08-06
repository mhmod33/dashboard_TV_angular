import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { LayoutComponent } from '../layout/layout';

@Component({
    selector: 'app-admin-details',
    standalone: true,
    imports: [CommonModule, LayoutComponent],
    templateUrl: './admin-details.html',
    styleUrl: './admin-details.css'
})
export class AdminDetailsComponent implements OnInit {
    adminId: string = '';
    admin: any = null;
    customers: any[] = [];
    isLoading = true;

    constructor(private route: ActivatedRoute, private systemService: SystemService) { }

    ngOnInit() {
        this.adminId = String(this.route.snapshot.paramMap.get('id'));
        this.fetchAdminDetails();
    }

    fetchAdminDetails() {
        this.isLoading = true;
        this.systemService.getAdminById(this.adminId).subscribe({
            next: (res: any) => {
                this.admin = res.admin;
                this.customers = res.admin.customers || [];
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
            }
        });
    }
}