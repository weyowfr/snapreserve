import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', params.id)
    .eq('seller_id', user.id) // sécurité: seulement ses propres voitures
    .eq('status', 'available') // on ne peut pas supprimer une voiture réservée

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
