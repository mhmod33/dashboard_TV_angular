# Role-Based Authorization System

This document explains how the role-based authorization system works in the TV Dashboard application.

## Overview

The application implements a hierarchical role-based access control (RBAC) system with three user roles:

1. **Super Admin** - Full access to all features including admin user management
2. **Admin** - Access to most features but cannot manage admin users
3. **Sub Admin** - Access to basic features and system management, but cannot manage users

## Role Hierarchy

```
Super Admin (Level 3) > Admin (Level 2) > Sub Admin (Level 1)
```

## Access Control Implementation

### 1. Authentication Guard (`src/app/guards/auth.guard.ts`)

- Protects all routes requiring authentication
- Checks user role against required role for each route
- Redirects unauthorized users to `/unauthorized` page
- Implements role hierarchy logic

### 2. Role Navigation Service (`src/app/services/role-navigation.service.ts`)

- Manages which navigation items are visible based on user role
- Provides role checking utilities
- Groups navigation items by sections

### 3. Route Protection (`src/app/app.routes.ts`)

Each route is protected with:
- `canActivate: [AuthGuard]` - Ensures user is authenticated
- `data: { role: 'superadmin' }` - Specifies required role

## Protected Routes

### Super Admin Only
- `/admin-users` - Manage admin users
- `/delete-all-customers` - Delete all customers

### Admin & Super Admin
- `/subadmin` - Manage subadmins
- `/add-admin` - Add new admins
- `/add-subadmin` - Add new subadmins

### All Authenticated Users
- `/home` - Dashboard
- `/payment-history` - Payment history
- `/customers` - Customer management
- `/add-customer` - Add customers
- `/add-payment` - Add payments
- `/add-balance` - Add balance
- `/default-prices` - Manage default prices
- `/time-periods` - Manage time periods
- `/remove-customer` - Remove individual customers

## Frontend Implementation

### Navigation Menu
- Dynamically shows/hides menu items based on user role
- Uses `RoleNavigationService` to determine visible items
- Groups items by sections (Main, Admin Controller, etc.)

### User Interface
- Shows current user role in sidebar
- Redirects unauthorized access attempts to error page
- Provides clear feedback about access restrictions

## Backend Requirements

The backend should implement:

1. **JWT Authentication** with role information in token
2. **Role-based middleware** for API endpoints
3. **Consistent role hierarchy** matching frontend
4. **Proper error responses** for unauthorized access

### Example Backend Middleware

```php
// Laravel/PHP example
public function checkRole($requiredRole) {
    $userRole = auth()->user()->role;
    
    $roleHierarchy = [
        'superadmin' => 3,
        'admin' => 2,
        'subadmin' => 1
    ];
    
    $userLevel = $roleHierarchy[$userRole] ?? 0;
    $requiredLevel = $roleHierarchy[$requiredRole] ?? 0;
    
    return $userLevel >= $requiredLevel;
}
```

## Testing the System

1. **Login as different user types** to test access
2. **Try accessing restricted routes** directly via URL
3. **Check navigation menu** shows correct items for each role
4. **Verify unauthorized redirects** work properly

## Security Considerations

- Always validate roles on both frontend and backend
- Use HTTPS for all authentication requests
- Implement proper session management
- Log unauthorized access attempts
- Regularly audit user permissions

## Future Enhancements

- Add role-based permissions for specific actions
- Implement dynamic permission management
- Add audit logging for role changes
- Create role-based dashboard widgets 