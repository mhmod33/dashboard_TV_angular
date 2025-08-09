interface AdminRoot {
    message: string;
    admins: Admin[];
}
interface Admin {
    id: number;
    name: string;
    role: 'superadmin' | 'admin' | 'subadmin';
    status: 'active' | 'inactive';
    balance: string;
    customers: Customer[] | string; 
}

interface Customer {
    id: number;
    serial_number: string;
    name: string;
    address: string;
    phone: string;
    payment_status: 'paid' | 'unpaid';
    status: 'active' | 'expired';
    owner: string;
    created_at: string;
    customer_name: string
    plan_id: number | string
    admin_id?: number | string
}


