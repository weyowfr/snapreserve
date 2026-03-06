export type CarStatus = 'available' | 'reserved' | 'sold'
export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled'

export interface Car {
  id: string
  seller_id: string
  slug: string
  title: string
  description: string
  price: number
  deposit: number
  photos: string[]
  status: CarStatus
  created_at: string
  sellers?: { name: string; email: string }
}

export interface Reservation {
  id: string
  car_id: string
  buyer_name: string
  buyer_phone: string
  buyer_email?: string
  stripe_payment_id: string
  platform_fee: number
  status: 'pending' | 'paid' | 'failed'
  created_at: string
  car?: Car
}

export interface Seller {
  id: string
  email: string
  name: string
  phone?: string
  stripe_customer_id?: string
  subscription_id?: string
  subscription_status: SubscriptionStatus
  subscription_end?: string
  created_at: string
}
