import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WebsiteGeneratorInput {
  businessName: string
  niche: string
  targetAudience: string
  primaryGoal: string
  biggestChallenge: string
  idealCustomer: {
    age?: string
    location?: string
    painPoint?: string
  }
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
  }
}

export async function generateWebsite(input: WebsiteGeneratorInput): Promise<WebsiteGenerationResult> {
  try {
    // Load system prompt
    const promptPath = path.join(process.cwd(), 'lib/ai/prompts/website_templates.txt')
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8')

    // Determine template structure based on templateId
    const templateConfig = getTemplateConfig(input.templateId)
    
    // Create user prompt with business data
    const userPrompt = `
Business Name: ${input.businessName}
Niche/Industry: ${input.niche}
Target Audience: ${input.targetAudience}
Primary Goal: ${input.primaryGoal}
Biggest Challenge: ${input.biggestChallenge}
Ideal Customer: Age ${input.idealCustomer.age || 'not specified'}, Location: ${input.idealCustomer.location || 'not specified'}, Pain Point: ${input.idealCustomer.painPoint || 'not specified'}
Brand Tone: ${input.brandTone || 'professional and engaging'}

Template: ${templateConfig.name} (ID: ${templateConfig.id})
Template Description: ${templateConfig.description}

${input.businessCaseContent ? `\nBusiness Context from Business Case:\n${input.businessCaseContent.substring(0, 1000)}\n` : ''}

Generate a complete, production-ready website following the ${templateConfig.name} template structure.
Include all sections: Hero, About, Features/Services, Social Proof, CTA, and Footer.
Use Tailwind CSS classes for all styling. Make it fully responsive and mobile-first.
Return ONLY valid HTML without any markdown formatting or code blocks.

The HTML should be self-contained and ready to render. Include appropriate semantic HTML5 elements.
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

    const generatedHtml = completion.choices[0]?.message?.content || ''
    
    // Parse the generated HTML to extract CSS if separate
    const result = parseGenerationResult(generatedHtml, input.templateId)
    
    return result
  } catch (error) {
    console.error('Error generating website:', error)
    throw new Error('Failed to generate website')
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

function parseGenerationResult(html: string, templateId: number): WebsiteGenerationResult {
  // Extract template info
  const templateConfig = getTemplateConfig(templateId)
  
  // Extract CSS if it exists separately (some AI outputs might have <style> tags)
  let css = ''
  let cleanHtml = html
  
  // Remove markdown code blocks if present
  cleanHtml = cleanHtml.replace(/```html\n?/g, '').replace(/```\n?/g, '')
  cleanHtml = cleanHtml.replace(/```\n?/g, '')
  
  // Extract style tag if present
  const styleMatch = cleanHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  if (styleMatch) {
    css = styleMatch[1]
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '')
  }
  
  // Ensure HTML has proper structure
  if (!cleanHtml.includes('<!DOCTYPE') && !cleanHtml.includes('<html')) {
    cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateConfig.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
${cleanHtml}
</body>
</html>`
  }
  
  // Extract sections from HTML (for metadata)
  const sections: string[] = []
  if (cleanHtml.includes('hero')) sections.push('hero')
  if (cleanHtml.includes('about')) sections.push('about')
  if (cleanHtml.includes('feature') || cleanHtml.includes('service')) sections.push('features')
  if (cleanHtml.includes('testimonial') || cleanHtml.includes('social')) sections.push('social-proof')
  if (cleanHtml.includes('cta') || cleanHtml.includes('contact')) sections.push('cta')
  if (cleanHtml.includes('footer')) sections.push('footer')
  
  return {
    html: cleanHtml,
    css: css || '',
    metadata: {
      templateId: templateId,
      templateName: templateConfig.name,
      sections,
      colorScheme: detectColorScheme(cleanHtml),
    },
  }
}

function detectColorScheme(html: string): string {
  if (html.includes('bg-blue') || html.includes('text-blue')) return 'blue'
  if (html.includes('bg-purple') || html.includes('text-purple')) return 'purple'
  if (html.includes('bg-green') || html.includes('text-green')) return 'green'
  if (html.includes('bg-orange') || html.includes('text-orange')) return 'orange'
  if (html.includes('bg-pink') || html.includes('text-pink')) return 'pink'
  return 'custom'
}

