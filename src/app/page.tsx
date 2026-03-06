import { createServerSupabaseClient } from '@/lib/supabase-server'
import LandingClient from './LandingClient'
import { Car } from '@/lib/types'

export default async function LandingPage() {
  const supabase = createServerSupabaseClient()
  const { data: cars } = await supabase
    .from('cars')
    .select('*, sellers(name)')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)

  return <LandingClient cars={(cars as Car[]) || []} />
}
