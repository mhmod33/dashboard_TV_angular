export interface SubadminRoot {
  message: string
  subadmins: Subadmin[]
}

export interface Subadmin {
  name: string
  role: string
  admin?: Admin
  date:string
  status: string
  balance: string
  customers: Customer[]
}

export interface Admin {
  id: number
  name: string
  password: string
  status: string
  role: string
  balance: string
  created_at: string
  updated_at: string
  deleted_at: any
  parent_admin_id: any
}

export interface Customer {
  id: number
  serial_number: string
  name: string
  address: string
  phone: string
  payment_status: string
  status: string
  owner: string
  created_at: string
}
