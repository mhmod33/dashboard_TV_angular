import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthServiceService } from '../services/auth-service/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route requires specific role
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const userRole = this.authService.getRole();
      if (!this.hasRequiredRole(userRole, requiredRole)) {
        // Redirect to unauthorized page if user doesn't have required role
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }

  private hasRequiredRole(userRole: string | null, requiredRole: string | string[]): boolean {
    if (!userRole) return false;

    // Normalize role names
    userRole = userRole.toLowerCase();
    if (Array.isArray(requiredRole)) {
        requiredRole = requiredRole.map(r => r.toLowerCase());
        return requiredRole.includes(userRole);
    }

    requiredRole = requiredRole.toLowerCase();

    // Role hierarchy: super admin > admin > sub admin
    const roleHierarchy = {
        'super admin': 3,
        'admin': 2,
        'sub admin': 1
    };

    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
}
} 