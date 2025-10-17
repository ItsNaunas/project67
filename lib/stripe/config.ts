import Stripe from 'stripe'

// In dev mode without Stripe keys, we can skip Stripe initialization
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY

if (!hasStripeKey && !isDevMode) {
  throw new Error('STRIPE_SECRET_KEY is not set. Set NEXT_PUBLIC_DEV_MODE=true to skip payment setup for development.')
}

// Use a dummy key for dev mode if no real key is provided
const stripeKey = hasStripeKey 
  ? process.env.STRIPE_SECRET_KEY! 
  : 'sk_test_dummy_key_for_dev_mode'

export const stripe = hasStripeKey 
  ? new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null as any // In dev mode without Stripe, this won't be used

export const PRICE_IDS = {
  UNLOCK: process.env.STRIPE_PRICE_ID_UNLOCK,
  HOSTING: process.env.STRIPE_PRICE_ID_HOSTING,
  CREDITS_500: process.env.STRIPE_PRICE_ID_CREDITS_500,
  CREDITS_1000: process.env.STRIPE_PRICE_ID_CREDITS_1000,
}

export const PRICES = {
  UNLOCK: 3350, // £33.50 in pence
  UNLOCK_ORIGINAL: 6700, // £67.00 in pence
  HOSTING: 300, // £3.00 in pence
  CREDITS_500: 699, // £6.99 in pence
  CREDITS_1000: 1299, // £12.99 in pence
}

