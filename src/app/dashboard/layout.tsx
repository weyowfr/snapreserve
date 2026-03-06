import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: seller } = await supabase
    .from('sellers')
    .select('subscription_status, name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav
        userId={user.id}
        userEmail={user.email || ''}
        userName={seller?.name}
        avatarUrl={seller?.avatar_url}
        subscriptionStatus={seller?.subscription_status || 'inactive'}
      />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 28px', paddingBottom: 100, maxWidth: 900 }}>
        {children}
      </main>
    </div>
  )
}
