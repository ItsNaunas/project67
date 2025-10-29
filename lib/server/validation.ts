/**
 * Input validation schemas and utilities
 * All API inputs MUST be validated before processing
 */

import { z } from 'zod'

// ==================== API Route Schemas ====================

export const GenerateInputSchema = z.object({
  dashboardId: z.string().uuid('Invalid dashboard ID'),
  type: z.enum(['business_case', 'content_strategy', 'website'], {
    errorMap: () => ({ message: 'Type must be business_case, content_strategy, or website' })
  }),
  templateId: z.number().int().min(1).max(8).optional()
})

export const CreateCheckoutSessionSchema = z.object({
  dashboardId: z.string().uuid('Invalid dashboard ID'),
  includeHosting: z.boolean().default(false)
})

export const BuyCreditsSchema = z.object({
  amount: z.number().int().min(100).max(10000, 'Amount must be between 100 and 10000'),
  priceId: z.enum(['credits_500', 'credits_1000']),
  userId: z.string().uuid('Invalid user ID')
})

export const CreateDashboardSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  business_name: z.string().min(2, 'Business name too short').max(100, 'Business name too long'),
  niche: z.string().min(2).max(100),
  product_service: z.string().min(5, 'Product/service description too short').max(500),
  target_audience: z.string().min(10).max(500),
  pricing_model: z.string().min(3).max(200),
  primary_goal: z.string().min(10).max(500),
  biggest_challenge: z.string().min(10).max(500),
  brand_tone: z.string().min(2).max(100),
  status: z.enum(['incomplete', 'complete']).default('incomplete')
})

export const SelectTemplateSchema = z.object({
  dashboardId: z.string().uuid('Invalid dashboard ID'),
  templateId: z.number().int().min(1).max(8, 'Template ID must be between 1 and 8')
})

// ==================== Helper Functions ====================

/**
 * Validate input and return parsed data
 * Throws ZodError if validation fails
 */
export function validateInput<T>(schema: z.Schema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safe validation that returns errors instead of throwing
 */
export function safeValidate<T>(schema: z.Schema<T>, data: unknown) {
  return schema.safeParse(data)
}

/**
 * Format Zod errors for API responses
 */
export function formatValidationErrors(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  }
}

// ==================== Type Exports ====================

export type GenerateInput = z.infer<typeof GenerateInputSchema>
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>
export type BuyCreditsInput = z.infer<typeof BuyCreditsSchema>
export type CreateDashboardInput = z.infer<typeof CreateDashboardSchema>
export type SelectTemplateInput = z.infer<typeof SelectTemplateSchema>

