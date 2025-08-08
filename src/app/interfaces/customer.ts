export interface CustomerRoot {
    message: string;
    customers: Customer[];
}

export interface Customer {
    id: string;
    serial_number: string;
    name: string;
    address: string;
    phone: string;
    owner: string;
    payment_status: string;
    status: string;
    created_at: string;
    customer_name: string;
    plan_id: number;
    admin_id: number;
}
