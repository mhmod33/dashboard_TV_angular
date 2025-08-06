import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { SystemService } from '../services/system/system.service';
import { LayoutComponent } from '../layout/layout';
import { AuthServiceService } from '../services/auth-service/auth-service.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  admin: any = null;
  role: any
  constructor(
    private router: Router,
    private systemService: SystemService,
    private authService: AuthServiceService,

  ) { }

  ngOnInit() {
    // Get the logged-in admin's details
    this.role = this.authService.getRole()
    console.log(this.role);
    const adminId = localStorage.getItem('id');
    if (this.role != 'superadmin') {
      if (adminId) {
        this.systemService.getAdminProfile(String(adminId)).subscribe({
          next: (res) => {
            this.admin = res.subadmin;
            console.log(res.subadmin)
          },
          error: (error) => {
            console.error('Error loading profile:', error);
          }
        });
      }
      
    }
    else{
      if (adminId) {
        this.systemService.getSuperadminProfile(String(adminId)).subscribe({
          next: (res) => {
            this.admin = res.superadmin;
            console.log(res.superadmin
            )
          },
          error: (error) => {
            console.error('Error loading profile:', error);
          }
        });
      }
    }
  }

  editProfile() {
    if (this.admin && this.admin.id) {
      this.router.navigate(['/edit-admin', this.admin.id]);
    }
  }
}

