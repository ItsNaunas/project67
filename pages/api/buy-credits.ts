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
    const { amount, priceId, userId } = req.body

    if (!amount || !priceId || !userId) {
      return res.status(400).json({ error: 'Amount, priceId, and userId are required' })
    }

    // In dev mode, skip Stripe and add credits directly
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    if (isDevMode) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      const currentCredits = profile?.credits || 0

      await supabase
        .from('profiles')
        .update({ credits: currentCredits + amount })
        .eq('id', userId)

      return res.status(200).json({ 
        url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_purchased=true` 
      })
    }

    const price = priceId === 'credits_500' ? PRICES.CREDITS_500 : PRICES.CREDITS_1000

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${amount} Credits`,
              description: 'Credits for creating new business dashboards',
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      client_reference_id: userId,
      metadata: {
        type: 'credits',
        amount: amount.toString(),
        userId,
      },
    })

    res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Buy credits error:', error)
    res.status(500).json({ error: error.message || 'Failed to create checkout session' })
  }
}

