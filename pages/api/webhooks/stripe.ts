import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import { Readable } from 'stream'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Stripe requires the raw body to construct the event
export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature'] as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.client_reference_id || session.metadata.userId
        const dashboardId = session.metadata.dashboardId
        const type = session.metadata.type

        if (type === 'credits') {
          // Handle credit purchase
          const amount = parseInt(session.metadata.amount)
          
          // Get current credits
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single()

          const currentCredits = profile?.credits || 0
          
          // Update with new credits
          await supabase
            .from('profiles')
            .update({ credits: currentCredits + amount })
            .eq('id', userId)

          await supabase.from('transactions').insert({
            user_id: userId,
            type: 'credits',
            amount: session.amount_total / 100,
            stripe_payment_id: session.payment_intent,
            credits_added: amount,
            status: 'completed',
          })

          console.log(`✅ Credits purchased for user ${userId}: ${amount} credits`)
        } else {
          // Handle main purchase
          await supabase
            .from('profiles')
            .update({ has_purchased: true })
            .eq('id', userId)

          if (dashboardId) {
            await supabase
              .from('dashboards')
              .update({ status: 'complete' })
              .eq('id', dashboardId)
          }

          await supabase.from('transactions').insert({
            user_id: userId,
            type: 'unlock',
            amount: session.amount_total / 100,
            stripe_payment_id: session.payment_intent,
            status: 'completed',
          })

          console.log(`✅ Purchase completed for user ${userId}`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        console.log(`💰 Payment succeeded: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        console.log(`❌ Payment failed: ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: error.message })
  }
}

