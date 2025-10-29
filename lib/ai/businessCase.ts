import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface BusinessCaseInput {
  businessName: string
  niche: string
  productService: string
  targetAudience: string
  pricingModel: string
  primaryGoal: string
  biggestChallenge: string
  brandTone?: string
}

export async function generateBusinessCase(input: BusinessCaseInput): Promise<string> {
  try {
    // Load system prompt
    const promptPath = path.join(process.cwd(), 'lib/ai/prompts/business_case.txt')
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8')

    // Create user prompt with input data
    const userPrompt = `
Business Name: ${input.businessName}
Niche/Industry: ${input.niche}
Product/Service Offering: ${input.productService}
Target Audience: ${input.targetAudience}
Pricing Model: ${input.pricingModel}
Primary Goal: ${input.primaryGoal}
Biggest Challenge: ${input.biggestChallenge}
Brand Tone: ${input.brandTone || 'not specified'}

Generate a comprehensive business case following the 7-section structure.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    })

    return completion.choices[0]?.message?.content || 'Failed to generate business case.'
  } catch (error) {
    console.error('Error generating business case:', error)
    throw new Error('Failed to generate business case')
  }
}

