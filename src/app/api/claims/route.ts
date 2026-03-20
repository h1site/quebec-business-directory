import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'info@h1site.com'

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

// POST - Submit a claim
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { business_id } = await request.json()
  if (!business_id) {
    return NextResponse.json({ error: 'business_id requis' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check business exists and is not already claimed
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('id, is_claimed, owner_id')
    .eq('id', business_id)
    .single()

  if (fetchError || !business) {
    return NextResponse.json({ error: `Entreprise introuvable: ${fetchError?.message || 'no data'}` }, { status: 404 })
  }

  if (business.is_claimed || business.owner_id) {
    return NextResponse.json({ error: 'Cette entreprise est déjà réclamée' }, { status: 409 })
  }

  // Try to check claim_status if column exists, otherwise proceed
  try {
    const { data: claimCheck } = await supabase
      .from('businesses')
      .select('claim_status')
      .eq('id', business_id)
      .single()

    if (claimCheck?.claim_status === 'pending') {
      return NextResponse.json({ error: 'Une réclamation est déjà en attente' }, { status: 409 })
    }
  } catch {
    // claim_status column may not exist yet — continue
  }

  // Submit claim
  const updateData: Record<string, unknown> = {
    claimed_by: user.id,
    claim_status: 'pending',
    claim_email: user.email,
  }

  const { error: updateError } = await supabase
    .from('businesses')
    .update(updateData)
    .eq('id', business_id)

  if (updateError) {
    // If columns don't exist yet, give a helpful message
    if (updateError.message?.includes('column')) {
      return NextResponse.json({ error: 'Migration requise: les colonnes claim_status, claimed_by, claim_email doivent être ajoutées à la table businesses.' }, { status: 500 })
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// GET - List claims (admin only)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const supabase = createServiceClient()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'

  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, city, slug, claim_email, claim_status, claimed_by, claimed_at, created_at')
    .not('claim_status', 'is', null)
    .eq('claim_status', status)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
