import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { sanitizeAndEnhanceHtml, TEMPLATE_THEMES } from './websiteHtmlSanitizer'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WebsiteGeneratorInput {
  businessName: string
  niche: string
  productService: string
  targetAudience: string
  pricingModel: string
  primaryGoal: string
  biggestChallenge: string
  brandTone?: string
  businessCaseContent?: string
  templateId: number
}

export interface WebsiteGenerationResult {
  html: string
  css: string
  metadata: {
    templateId: number
    templateName: string
    sections: string[]
    colorScheme: string
    themeMode: 'light' | 'dark'
  }
}

export async function generateWebsite(input: WebsiteGeneratorInput): Promise<WebsiteGenerationResult> {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    // Load system prompt
    const promptPath = path.join(process.cwd(), 'lib/ai/prompts/website_templates.txt')
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Template prompt file not found at: ${promptPath}`)
    }
    
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8')

    // Determine template structure based on templateId
    const templateConfig = getTemplateConfig(input.templateId)
    const themeConfig = TEMPLATE_THEMES[input.templateId as keyof typeof TEMPLATE_THEMES]
    
    // Create enhanced user prompt with business data
    const userPrompt = `
Business Name: ${input.businessName}
Niche/Industry: ${input.niche}
Product/Service Offering: ${input.productService}
Target Audience: ${input.targetAudience}
Pricing Model: ${input.pricingModel}
Primary Goal: ${input.primaryGoal}
Biggest Challenge: ${input.biggestChallenge}
Brand Tone: ${input.brandTone || 'professional and engaging'}

Template: ${templateConfig.name} (ID: ${templateConfig.id})
Template Description: ${templateConfig.description}
Theme Mode: ${themeConfig?.mode || 'light'} mode preferred

${input.businessCaseContent ? `\nBusiness Context from Business Case:\n${input.businessCaseContent.substring(0, 1000)}\n` : ''}

CRITICAL REQUIREMENTS:
1. Generate a complete, production-ready website following the ${templateConfig.name} template structure
2. ALL sections MUST have proper IDs: hero, about, features, cta, footer
3. Use section-specific background colors - DO NOT set text-white on <body> or <html> tags
4. Ensure proper contrast: light sections use dark text (text-gray-900), dark sections use light text (text-white)
5. Include at least ONE clear call-to-action button in the hero section
6. Use semantic HTML5 elements: <header>, <main>, <section>, <footer>
7. Make it fully responsive with mobile-first Tailwind classes
8. Include descriptive alt text on ALL images
9. Use high-quality Unsplash images relevant to ${input.niche}

Return ONLY valid HTML without any markdown formatting, code blocks, or explanations.
The HTML should be self-contained and ready to render.
    `.trim()

    console.log(`[Website Generator] Calling OpenAI API for template ${input.templateId}...`)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    })

    console.log(`[Website Generator] OpenAI API call successful`)

    const generatedHtml = completion.choices[0]?.message?.content || ''
    
    if (!generatedHtml) {
      throw new Error('OpenAI returned empty response')
    }
    
    // Use enhanced sanitization pipeline
    const sanitized = sanitizeAndEnhanceHtml(
      generatedHtml,
      input.templateId,
      input.businessName
    )
    
    return {
      html: sanitized.html,
      css: '', // CSS is now embedded in the HTML via <style> tags
      metadata: {
        templateId: input.templateId,
        templateName: templateConfig.name,
        sections: sanitized.metadata.sections,
        colorScheme: sanitized.metadata.colorScheme,
        themeMode: themeConfig?.mode || 'light',
      },
    }
  } catch (error) {
    console.error('Error generating website:', error)
    // Provide more specific error details
    if (error instanceof Error) {
      throw new Error(`Failed to generate website: ${error.message}`)
    }
    throw new Error('Failed to generate website: Unknown error')
  }
}

function getTemplateConfig(templateId: number) {
  const templates = [
    { id: 1, name: 'Luxury Minimalist', description: 'Clean, elegant design for premium brands with plenty of white space' },
    { id: 2, name: 'Bold & Modern', description: 'High-impact visuals for tech startups with bold typography and vibrant colors' },
    { id: 3, name: 'Playful Creative', description: 'Fun, vibrant layouts for creative businesses with playful elements' },
    { id: 4, name: 'Professional Corporate', description: 'Traditional, trustworthy design for established businesses' },
    { id: 5, name: 'Wellness & Lifestyle', description: 'Calm, inviting design for health brands with soft colors' },
    { id: 6, name: 'E-commerce Pro', description: 'Conversion-optimized for online stores with product showcases' },
    { id: 7, name: 'Agency Portfolio', description: 'Showcase your work with style and modern grid layouts' },
    { id: 8, name: 'SaaS Landing', description: 'Convert visitors to customers with clear value propositions and CTAs' },
  ]
  
  return templates.find(t => t.id === templateId) || templates[0]
}


