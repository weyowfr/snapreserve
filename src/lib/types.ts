export type CarStatus = 'available' | 'reserved' | 'sold'
export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled'
export type AccountType = 'pro' | 'autoentrepreneur' | 'particulier'

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
  sellers?: Seller
}

export interface Seller {
  id: string
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  birth_date?: string
  account_type?: AccountType
  company_name?: string
  siret?: string
  vat_number?: string
  website?: string
  snapchat_handle?: string
  instagram_handle?: string
  tiktok_handle?: string
  years_experience?: number
  cars_per_month?: number
  iban?: string
  bic?: string
  bank_name?: string
  account_holder?: string
  avatar_url?: string
  bio?: string
  specialties?: string[]
  is_verified?: boolean
  total_sales?: number
  rating?: number
  stripe_customer_id?: string
  subscription_id?: string
  subscription_status: SubscriptionStatus
  subscription_end?: string
  created_at: string
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
  cars?: Car
}

export interface Buyer {
  id: string
  auth_id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  avatar_url?: string
  total_reservations?: number
  created_at: string
}
