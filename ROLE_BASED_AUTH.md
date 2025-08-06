# Role-Based Authorization System

This document explains how the role-based authorization system works in the TV Dashboard application.

## Overview

The application implements a hierarchical role-based access control (RBAC) system with three user roles:

1. **superadmin** - Full access to all features including admin user management
2. **Admin** - Access to most features but cannot manage admin users or delete all customers
3. **Sub Admin** - Access to basic features but cannot manage users or delete all customers

## Access Matrix

| Page | superadmin | Admin | Sub Admin |
|------|-------------|-------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Payment History | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ |
| Admin Users | ✅ | ❌ | ❌ |
| SubAdmin | ✅ | ✅ | ❌ |
| Default Prices | ✅ | ✅ | ✅ |
| Time Periods | ✅ | ✅ | ✅ |
| Remove Customer | ✅ | ✅ | ✅ |
| Delete All Customers | ✅ | ❌ | ❌ |

## Role Hierarchy

```
superadmin (Level 3) > Admin (Level 2) > Sub Admin (Level 1)
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

### superadmin Only
- `/admin-users` - Manage admin users
- `/add-admin` - Add new admins
- `/delete-all-customers` - Delete all customers

### Admin & superadmin
- `/subadmin` - Manage subadmins
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

## Backend Implementation

The backend implements:

1. **Token-based Authentication** with role information in token
2. **Role-based middleware** for API endpoints
3. **Consistent role hierarchy** matching frontend
4. **Proper error responses** for unauthorized access

### Backend Middleware

```php
// app/Http/Middleware/RoleMiddleware.php
public function handle(Request $request, Closure $next, $requiredRole)
{
    // Check if user is authenticated
    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized access',
        ], 401);
    }

    $user = Auth::user();
    
    // Check if user has the required role
    if (!$this->hasRequiredRole($user->role, $requiredRole)) {
        return response()->json([
            'success' => false,
            'message' => 'You do not have permission to access this resource',
        ], 403);
    }

    return $next($request);
}

private function hasRequiredRole($userRole, $requiredRole)
{
    // If required role is an array, check if user role is in the array
    if (is_array($requiredRole)) {
        return in_array($userRole, $requiredRole);
    }

    // Role hierarchy: superadmin > admin > sub admin
    $roleHierarchy = [
        'superadmin' => 3,
        'admin' => 2,
        'sub admin' => 1
    ];

    $userRoleLevel = $roleHierarchy[$userRole] ?? 0;
    $requiredRoleLevel = $roleHierarchy[$requiredRole] ?? 0;

    return $userRoleLevel >= $requiredRoleLevel;
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