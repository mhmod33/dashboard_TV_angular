# ACAS Admin Dashboard

A simple Angular 19 admin dashboard for managing users and customers.

## Project Structure

```
tv/src/app/
├── app.ts              # Main AppComponent
├── app.html            # App template
├── app.css             # App styles
├── app.config.ts       # App configuration
├── app.routes.ts       # Route definitions
├── admin-users/        # Admin users page
├── add-admin/          # Add admin form
├── customers/          # Customers page
├── add-customer/       # Add customer form
├── home/              # Dashboard home
├── login/             # Login page
├── layout/            # Layout with sidebar
├── payment-history/   # Payment history
├── subadmin/          # Sub admin page
└── add-subadmin/      # Add sub admin form
```

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:4200`

## Key Features

- **Admin Users Management**: View, add, edit, and delete admin users
- **Customer Management**: Manage customer accounts
- **Payment History**: Track payment transactions
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean and user-friendly interface

## Components Explained

### AppComponent (app.ts)
- This is the main component that loads first
- Contains the basic app structure with header and router outlet
- All other pages are loaded inside this component

### LayoutComponent (layout/)
- Provides the sidebar navigation
- Contains the main navigation menu
- Shows user information and logout functionality

### AdminUsersComponent (admin-users/)
- Displays a list of admin users in a table
- Has search and filter functionality
- Shows user status, balance, and customer count

### AddAdminComponent (add-admin/)
- Form to create new admin users
- Includes validation for username, password, and balance
- Has user type selection (Super Admin, Admin, Sub Admin)

## Routing

The app uses Angular routing to navigate between pages:

- `/login` - Login page
- `/home` - Dashboard home
- `/admin-users` - Admin users list
- `/add-admin` - Add new admin form
- `/customers` - Customers list
- `/add-customer` - Add new customer form
- `/payment-history` - Payment history
- `/subadmin` - Sub admin management

## Styling

- Uses CSS for styling (no external UI libraries)
- Responsive design that works on all screen sizes
- Modern color scheme with purple/blue accents
- Clean and professional appearance

## Beginner Notes

- All components are **standalone** (Angular 19 feature)
- Uses **TypeScript** for type safety
- **Two-way binding** with `[(ngModel)]` for forms
- **Event binding** with `(click)` for buttons
- **Property binding** with `[class]` for dynamic classes
- **Structural directives** like `*ngFor` and `*ngIf`

## Common Angular Concepts Used

1. **Components**: Reusable UI pieces
2. **Services**: For data management (not used yet, but ready to add)
3. **Routing**: Navigation between pages
4. **Forms**: User input handling
5. **Pipes**: Data transformation (like currency formatting)
6. **Directives**: DOM manipulation and conditional rendering
