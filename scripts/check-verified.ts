import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function check() {
  const { data, error } = await supabase
    .from('businesses')
    .select('name, verified_phone, verified_address, verified_city, verified_postal_code, verification_confidence')
    .not('verified_at', 'is', null)
    .limit(20)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log(`\n✅ ${data.length} businesses verified:\n`)

  for (const biz of data) {
    console.log(`📍 ${biz.name}`)
    if (biz.verified_phone) console.log(`   Phone: ${biz.verified_phone}`)
    if (biz.verified_address) console.log(`   Address: ${biz.verified_address}`)
    if (biz.verified_city) console.log(`   City: ${biz.verified_city} ${biz.verified_postal_code || ''}`)
    console.log(`   Confidence: ${biz.verification_confidence}`)
    console.log('')
  }
}

check()
