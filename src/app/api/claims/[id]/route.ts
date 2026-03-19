import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'info@h1site.com'

async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user || user.email !== ADMIN_EMAIL) return null
  return user
}

// PATCH - Approve or reject a claim
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const admin = await getAdminUser(request)
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { action } = await request.json()
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (action === 'approve') {
    // Get the business to find claimed_by
    const { data: business } = await supabase
      .from('businesses')
      .select('claimed_by')
      .eq('id', id)
      .single()

    if (!business?.claimed_by) {
      return NextResponse.json({ error: 'Aucune réclamation trouvée' }, { status: 404 })
    }

    const { error } = await supabase
      .from('businesses')
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString(),
        owner_id: business.claimed_by,
        claim_status: 'approved',
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const { error } = await supabase
      .from('businesses')
      .update({
        claim_status: 'rejected',
        claimed_by: null,
        claim_email: null,
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
