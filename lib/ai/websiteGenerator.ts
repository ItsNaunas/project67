import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

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
Product/Service Offering: ${input.productService}
Target Audience: ${input.targetAudience}
Pricing Model: ${input.pricingModel}
Primary Goal: ${input.primaryGoal}
Biggest Challenge: ${input.biggestChallenge}
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
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
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
  let cleanHtml = html.trim()
  
  // Remove markdown code blocks if present (aggressive cleaning)
  cleanHtml = cleanHtml.replace(/```html\n?/gi, '')
  cleanHtml = cleanHtml.replace(/```\n?/g, '')
  cleanHtml = cleanHtml.replace(/^```/gm, '')
  
  // Remove any explanatory text before/after HTML
  const htmlStartMatch = cleanHtml.match(/<!DOCTYPE html>/i)
  if (htmlStartMatch) {
    cleanHtml = cleanHtml.substring(htmlStartMatch.index || 0)
  }
  
  const htmlEndMatch = cleanHtml.match(/<\/html>/i)
  if (htmlEndMatch) {
    const endIndex = (htmlEndMatch.index || 0) + htmlEndMatch[0].length
    cleanHtml = cleanHtml.substring(0, endIndex)
  }
  
  // Extract style tag if present
  const styleMatch = cleanHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  if (styleMatch) {
    css = styleMatch[1]
    // Keep style tag in HTML for now, will be managed in full structure
  }
  
  // Validate and ensure proper HTML structure
  const hasDoctype = cleanHtml.includes('<!DOCTYPE')
  const hasHtmlTag = cleanHtml.includes('<html')
  const hasHead = cleanHtml.includes('<head')
  const hasBody = cleanHtml.includes('<body')
  
  // Ensure Tailwind CDN is included
  const hasTailwind = cleanHtml.includes('tailwindcss.com') || cleanHtml.includes('cdn.tailwindcss')
  
  if (!hasDoctype || !hasHtmlTag || !hasHead || !hasBody || !hasTailwind) {
    // Rebuild with proper structure
    let bodyContent = cleanHtml
    
    // Extract body content if partial HTML
    const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    if (bodyMatch) {
      bodyContent = bodyMatch[1]
    }
    
    cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateConfig.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body class="antialiased">
${bodyContent}
</body>
</html>`
  }
  
  // Validate minimum sections are present
  const requiredSections = ['hero', 'cta', 'footer']
  const missingSections: string[] = []
  
  for (const section of requiredSections) {
    const hasSection = cleanHtml.toLowerCase().includes(section) || 
                      cleanHtml.includes(`id="${section}"`) ||
                      cleanHtml.includes(`class="${section}"`)
    if (!hasSection) {
      missingSections.push(section)
    }
  }
  
  // Log warning if sections are missing (for debugging)
  if (missingSections.length > 0) {
    console.warn(`Generated website missing sections: ${missingSections.join(', ')}`)
  }
  
  // Extract sections from HTML (for metadata)
  const sections: string[] = []
  const lowerHtml = cleanHtml.toLowerCase()
  if (lowerHtml.includes('hero')) sections.push('hero')
  if (lowerHtml.includes('about')) sections.push('about')
  if (lowerHtml.includes('feature') || lowerHtml.includes('service')) sections.push('features')
  if (lowerHtml.includes('testimonial') || lowerHtml.includes('social') || lowerHtml.includes('review')) sections.push('social-proof')
  if (lowerHtml.includes('cta') || lowerHtml.includes('contact')) sections.push('cta')
  if (lowerHtml.includes('footer')) sections.push('footer')
  
  // Ensure at least 4 sections (quality check)
  if (sections.length < 4) {
    console.warn(`Website only has ${sections.length} sections. Expected at least 4.`)
  }
  
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

