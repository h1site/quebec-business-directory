// Supabase Edge Function to send claim notification emails
// Triggered when a new business claim is created

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClaimEmailData {
  type: 'new_claim' | 'claim_approved' | 'claim_rejected'
  claim: {
    id: string
    user_email: string
    user_name?: string
    user_phone?: string
    verification_method: string
    status: string
    notes?: string
  }
  business: {
    name: string
    city: string
    slug: string
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, claim, business }: ClaimEmailData = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    let emailHtml = ''
    let emailSubject = ''
    let toEmail = ''

    switch (type) {
      case 'new_claim':
        // Email to admin
        toEmail = 'info@h1site.com'
        emailSubject = `🔔 Nouvelle réclamation: ${business.name}`
        emailHtml = `
          <h2>Nouvelle réclamation de fiche d'entreprise</h2>
          <p>Une nouvelle demande de réclamation a été soumise:</p>

          <h3>Entreprise</h3>
          <ul>
            <li><strong>Nom:</strong> ${business.name}</li>
            <li><strong>Ville:</strong> ${business.city}</li>
            <li><strong>URL:</strong> <a href="https://registreduquebec.com/entreprise/${business.slug}">Voir la fiche</a></li>
          </ul>

          <h3>Demandeur</h3>
          <ul>
            <li><strong>Email:</strong> ${claim.user_email}</li>
            ${claim.user_name ? `<li><strong>Nom:</strong> ${claim.user_name}</li>` : ''}
            ${claim.user_phone ? `<li><strong>Téléphone:</strong> ${claim.user_phone}</li>` : ''}
          </ul>

          <h3>Méthode de vérification</h3>
          <p>${getVerificationMethodLabel(claim.verification_method)}</p>

          ${claim.status === 'approved' ?
            '<p style="color: green;"><strong>✅ Approuvé automatiquement (domaine email correspond)</strong></p>' :
            '<p><strong>⏳ En attente de révision</strong></p>'
          }

          <p>
            <a href="https://registreduquebec.com/admin/claims"
               style="background: #0f4c81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
              Gérer les réclamations
            </a>
          </p>
        `
        break

      case 'claim_approved':
        // Email to user
        toEmail = claim.user_email
        emailSubject = `✅ Réclamation approuvée: ${business.name}`
        emailHtml = `
          <h2>Votre réclamation a été approuvée!</h2>
          <p>Félicitations! Votre demande de réclamation pour <strong>${business.name}</strong> a été approuvée.</p>

          <h3>Prochaines étapes</h3>
          <ul>
            <li>Vous pouvez maintenant gérer cette fiche d'entreprise</li>
            <li>Modifier les informations</li>
            <li>Ajouter des photos</li>
            <li>Répondre aux avis</li>
          </ul>

          <p>
            <a href="https://registreduquebec.com/entreprise/${business.slug}"
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
              Gérer ma fiche
            </a>
          </p>

          <p style="color: #718096; font-size: 14px; margin-top: 40px;">
            Si vous n'avez pas fait cette demande, veuillez nous contacter immédiatement.
          </p>
        `
        break

      case 'claim_rejected':
        // Email to user
        toEmail = claim.user_email
        emailSubject = `❌ Réclamation non approuvée: ${business.name}`
        emailHtml = `
          <h2>Votre réclamation n'a pas été approuvée</h2>
          <p>Malheureusement, votre demande de réclamation pour <strong>${business.name}</strong> n'a pas pu être approuvée.</p>

          ${claim.notes ? `
            <h3>Raison</h3>
            <p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px;">
              ${claim.notes}
            </p>
          ` : ''}

          <h3>Que faire ensuite?</h3>
          <ul>
            <li>Vérifiez que vous êtes bien le propriétaire de cette entreprise</li>
            <li>Préparez des documents justificatifs (factures, permis, NEQ)</li>
            <li>Contactez-nous pour plus d'informations</li>
          </ul>

          <p>
            <a href="mailto:info@h1site.com"
               style="background: #0f4c81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
              Nous contacter
            </a>
          </p>
        `
        break
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Registre du Québec <noreply@registreduquebec.com>',
        to: [toEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(data)}`)
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function getVerificationMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    'email_domain': '📧 Email domaine (vérification automatique)',
    'google_business': '🔗 Google My Business',
    'manual': '📝 Demande manuelle'
  }
  return labels[method] || method
}
