export interface PaymentRoot {
  message: string
  payments: Payemnt[]
}

export interface Payemnt {
  id: number
  serial_number: string
  payment_id: string
  owner: string
  customer_name: string
  date: string
  exp_before: string
  exp_after: string
  cost: string
}
