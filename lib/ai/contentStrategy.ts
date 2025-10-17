import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ContentStrategyInput {
  businessName: string
  niche: string
  targetAudience: string
  primaryGoal: string
  brandTone?: string
}

export async function generateContentStrategy(input: ContentStrategyInput): Promise<string> {
  try {
    // Load system prompt
    const promptPath = path.join(process.cwd(), 'lib/ai/prompts/content_strategy.txt')
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8')

    // Create user prompt with input data
    const userPrompt = `
Business Name: ${input.businessName}
Niche/Industry: ${input.niche}
Target Audience: ${input.targetAudience}
Primary Goal: ${input.primaryGoal}
Brand Tone: ${input.brandTone || 'professional and engaging'}

Generate 3 viral content hooks following the framework structure.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 3000,
    })

    return completion.choices[0]?.message?.content || 'Failed to generate content strategy.'
  } catch (error) {
    console.error('Error generating content strategy:', error)
    throw new Error('Failed to generate content strategy')
  }
}

