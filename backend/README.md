# TV Dashboard Backend

This is the backend API for the TV Dashboard application with role-based authentication.

## Role Hierarchy

- **superadmin**: Has access to all features including admin user management
- **admin**: Has access to most features but cannot manage admin users
- **subadmin**: Has access to basic features and system management, but cannot manage users

## Protected Routes

### Super Admin Only Routes
- `/api/admin-users` - Manage admin users
- `/api/delete-all-customers` - Delete all customers

### Admin & Super Admin Routes
- `/api/subadmin` - Manage subadmins
- `/api/add-admin` - Add new admins
- `/api/add-subadmin` - Add new subadmins

### All Authenticated Users
- `/api/home` - Dashboard
- `/api/payment-history` - Payment history
- `/api/customers` - Customer management
- `/api/add-customer` - Add customers
- `/api/add-payment` - Add payments
- `/api/add-balance` - Add balance
- `/api/default-prices` - Manage default prices
- `/api/time-periods` - Manage time periods
- `/api/remove-customer` - Remove individual customers

## Authentication

The backend should implement JWT-based authentication with role-based access control. Each API endpoint should verify the user's role before allowing access.

## Example Middleware

```php
// Role-based middleware example
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

## API Response Format

```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {},
    "user": {
        "id": 1,
        "name": "Admin User",
        "role": "superadmin"
    }
}
``` 