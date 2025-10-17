import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe, PRICES } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { dashboardId, includeHosting } = req.body

    if (!dashboardId) {
      return res.status(400).json({ error: 'Dashboard ID is required' })
    }

    // In dev mode, skip Stripe and mark as purchased directly
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    if (isDevMode) {
      // Directly update profile in dev mode
      const { data: dashboard } = await supabase
        .from('dashboards')
        .select('user_id')
        .eq('id', dashboardId)
        .single()

      if (dashboard) {
        await supabase
          .from('profiles')
          .update({ has_purchased: true })
          .eq('id', dashboard.user_id)

        await supabase
          .from('dashboards')
          .update({ status: 'complete' })
          .eq('id', dashboardId)
      }

      // Redirect to success page
      return res.status(200).json({ 
        url: `${process.env.NEXT_PUBLIC_APP_URL}/success?dashboard=${dashboardId}` 
      })
    }

    // Get dashboard to verify ownership
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*, profiles(*)')
      .eq('id', dashboardId)
      .single()

    if (dashboardError || !dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' })
    }

    const lineItems: any[] = [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Project 67 - Full Business Kit',
            description: 'Unlimited AI regenerations, full dashboard access, and lifetime updates',
            images: [],
          },
          unit_amount: PRICES.UNLOCK,
        },
        quantity: 1,
      },
    ]

    let subscriptionLineItems: any[] = []

    if (includeHosting) {
      subscriptionLineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Website Hosting',
            description: 'Professional hosting for your website',
          },
          unit_amount: PRICES.HOSTING,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: includeHosting ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&dashboard=${dashboardId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?dashboard=${dashboardId}`,
      client_reference_id: dashboard.user_id,
      metadata: {
        dashboardId,
        userId: dashboard.user_id,
      },
      subscription_data: includeHosting
        ? {
            trial_period_days: 60, // 2 months free
            metadata: {
              dashboardId,
              userId: dashboard.user_id,
            },
          }
        : undefined,
    })

    res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    res.status(500).json({ error: error.message || 'Failed to create checkout session' })
  }
}

