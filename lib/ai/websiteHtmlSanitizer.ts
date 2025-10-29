/**
 * HTML Sanitizer and Theme Safety System
 * Ensures generated websites are always readable and visually consistent
 */

// Template theme configurations with safe color pairings
export const TEMPLATE_THEMES = {
  1: { // Luxury Minimalist
    mode: 'light' as const,
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: 'text-amber-600',
    heading: 'text-gray-900',
  },
  2: { // Bold & Modern
    mode: 'dark' as const,
    bg: 'bg-gradient-to-br from-blue-600 to-purple-600',
    text: 'text-white',
    accent: 'text-yellow-400',
    heading: 'text-white',
  },
  3: { // Playful Creative
    mode: 'light' as const,
    bg: 'bg-gradient-to-br from-orange-50 to-pink-50',
    text: 'text-gray-800',
    accent: 'text-pink-600',
    heading: 'text-gray-900',
  },
  4: { // Professional Corporate
    mode: 'light' as const,
    bg: 'bg-white',
    text: 'text-gray-700',
    accent: 'text-blue-800',
    heading: 'text-blue-900',
  },
  5: { // Wellness & Lifestyle
    mode: 'light' as const,
    bg: 'bg-stone-50',
    text: 'text-gray-700',
    accent: 'text-green-600',
    heading: 'text-gray-800',
  },
  6: { // E-commerce Pro
    mode: 'light' as const,
    bg: 'bg-white',
    text: 'text-gray-800',
    accent: 'text-blue-600',
    heading: 'text-gray-900',
  },
  7: { // Agency Portfolio
    mode: 'dark' as const,
    bg: 'bg-black',
    text: 'text-gray-200',
    accent: 'text-sky-400',
    heading: 'text-white',
  },
  8: { // SaaS Landing
    mode: 'light' as const,
    bg: 'bg-white',
    text: 'text-gray-700',
    accent: 'text-blue-600',
    heading: 'text-gray-900',
  },
} as const

// Dangerous class combinations that create readability issues
const UNSAFE_CLASS_PATTERNS = [
  // White text on white/light backgrounds
  { pattern: /text-white.*bg-white/g, safe: 'text-gray-900 bg-white' },
  { pattern: /bg-white.*text-white/g, safe: 'bg-white text-gray-900' },
  { pattern: /text-white.*bg-gray-50/g, safe: 'text-gray-900 bg-gray-50' },
  { pattern: /text-white.*bg-gray-100/g, safe: 'text-gray-900 bg-gray-100' },
  
  // Black text on black/dark backgrounds
  { pattern: /text-black.*bg-black/g, safe: 'text-white bg-black' },
  { pattern: /bg-black.*text-black/g, safe: 'bg-black text-white' },
  { pattern: /text-gray-900.*bg-gray-900/g, safe: 'text-white bg-gray-900' },
  
  // Light text on light backgrounds
  { pattern: /text-gray-100.*bg-gray-50/g, safe: 'text-gray-900 bg-gray-50' },
  { pattern: /text-gray-200.*bg-white/g, safe: 'text-gray-900 bg-white' },
]

/**
 * Normalizes dangerous color class combinations
 */
export function normalizeColorClasses(html: string): string {
  let normalized = html

  // Fix unsafe patterns
  UNSAFE_CLASS_PATTERNS.forEach(({ pattern, safe }) => {
    normalized = normalized.replace(pattern, safe)
  })

  // Remove global text-white from body/html tags (causes cascade issues)
  normalized = normalized.replace(
    /<body([^>]*?)class="([^"]*?)text-white([^"]*?)"/gi,
    '<body$1class="$2$3"'
  )
  normalized = normalized.replace(
    /<html([^>]*?)class="([^"]*?)text-white([^"]*?)"/gi,
    '<html$1class="$2$3"'
  )

  return normalized
}

/**
 * Generates CSS variables for theme consistency
 */
export function generateThemeVariables(templateId: number): string {
  const theme = TEMPLATE_THEMES[templateId as keyof typeof TEMPLATE_THEMES] || TEMPLATE_THEMES[1]
  
  return `
    :root {
      --theme-mode: ${theme.mode};
      --theme-bg: ${theme.bg};
      --theme-text: ${theme.text};
      --theme-accent: ${theme.accent};
      --theme-heading: ${theme.heading};
    }
    
    /* Ensure minimum contrast ratios */
    body {
      color: ${theme.mode === 'dark' ? '#e5e5e5' : '#1f2937'};
      line-height: 1.6;
    }
    
    /* Prevent invisible text issues */
    .text-white { color: #ffffff !important; }
    .text-black { color: #000000 !important; }
    .text-gray-900 { color: #111827 !important; }
    .text-gray-100 { color: #f3f4f6 !important; }
    
    /* Section spacing consistency */
    section {
      padding-top: 4rem;
      padding-bottom: 4rem;
    }
    
    @media (min-width: 768px) {
      section {
        padding-top: 5rem;
        padding-bottom: 5rem;
      }
    }
    
    @media (min-width: 1024px) {
      section {
        padding-top: 6rem;
        padding-bottom: 6rem;
      }
    }
  `.trim()
}

/**
 * Injects Google Fonts for visual consistency
 */
export function injectFonts(): string {
  return `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  `.trim()
}

/**
 * Creates fallback section if missing
 */
export function createFallbackSection(sectionType: string, businessName: string): string {
  const fallbacks: Record<string, string> = {
    hero: `
      <section id="hero" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">Welcome to ${businessName}</h1>
          <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Transform your business with our innovative solutions</p>
          <a href="#contact" class="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">Get Started</a>
        </div>
      </section>
    `,
    about: `
      <section id="about" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-4xl font-bold mb-8 text-center text-gray-900">About Us</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto text-center">We're dedicated to delivering exceptional results for our clients through innovation and expertise.</p>
        </div>
      </section>
    `,
    features: `
      <section id="features" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-4xl font-bold mb-12 text-center text-gray-900">Our Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-xl shadow-lg">
              <h3 class="text-xl font-bold mb-3 text-gray-900">Quality Service</h3>
              <p class="text-gray-600">Delivering excellence in every project</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg">
              <h3 class="text-xl font-bold mb-3 text-gray-900">Expert Team</h3>
              <p class="text-gray-600">Experienced professionals at your service</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg">
              <h3 class="text-xl font-bold mb-3 text-gray-900">Fast Delivery</h3>
              <p class="text-gray-600">Quick turnaround without compromising quality</p>
            </div>
          </div>
        </div>
      </section>
    `,
    cta: `
      <section id="cta" class="py-20 bg-blue-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers today</p>
          <a href="#contact" class="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">Contact Us Now</a>
        </div>
      </section>
    `,
    footer: `
      <footer id="footer" class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <p class="text-gray-400">&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `,
  }
  
  return fallbacks[sectionType] || ''
}

/**
 * Validates and ensures all required sections exist
 */
export function ensureRequiredSections(html: string, businessName: string): string {
  const requiredSections = ['hero', 'about', 'features', 'cta', 'footer']
  let enhancedHtml = html
  
  // Check for missing sections and append fallbacks
  const bodyMatch = enhancedHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (bodyMatch) {
    let bodyContent = bodyMatch[1]
    const missingSections: string[] = []
    
    requiredSections.forEach(section => {
      const hasSection = bodyContent.toLowerCase().includes(`id="${section}"`) ||
                        bodyContent.toLowerCase().includes(`id='${section}'`) ||
                        (bodyContent.match(new RegExp(`<section[^>]*>`, 'gi'))?.some(tag => 
                          tag.toLowerCase().includes(section)
                        ))
      
      if (!hasSection) {
        missingSections.push(section)
        bodyContent += createFallbackSection(section, businessName)
      }
    })
    
    if (missingSections.length > 0) {
      console.log(`Added fallback sections: ${missingSections.join(', ')}`)
      enhancedHtml = enhancedHtml.replace(
        /<body[^>]*>[\s\S]*<\/body>/i,
        `<body class="antialiased">\n${bodyContent}\n</body>`
      )
    }
  }
  
  return enhancedHtml
}

/**
 * Wraps HTML in a production-ready shell with all safety features
 */
export function wrapInSafetyShell(
  html: string,
  templateId: number,
  businessName: string,
  metadata: { colorScheme: string }
): string {
  const theme = TEMPLATE_THEMES[templateId as keyof typeof TEMPLATE_THEMES] || TEMPLATE_THEMES[1]
  const themeVars = generateThemeVariables(templateId)
  const fonts = injectFonts()
  
  // Extract body content if HTML is partial
  let bodyContent = html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (bodyMatch) {
    bodyContent = bodyMatch[1]
  } else {
    // Check if it's a full HTML document
    const hasDoctype = html.includes('<!DOCTYPE')
    if (hasDoctype) {
      return html // Already complete, return as-is
    }
  }
  
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${businessName} - Professional website">
  <title>${businessName}</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts -->
  ${fonts}
  
  <!-- Theme Variables and Safety Styles -->
  <style>
    ${themeVars}
    
    /* Font Family Defaults */
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Playfair Display', 'Inter', serif;
      font-weight: 700;
    }
    
    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
    
    /* Image responsiveness */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Button consistency */
    button, .btn, a[class*="px-"] {
      transition: all 0.2s ease-in-out;
    }
    
    /* Dev mode section boundaries (hidden by default) */
    body.dev-mode section {
      outline: 2px dashed rgba(29, 205, 159, 0.5);
      outline-offset: -2px;
      position: relative;
    }
    
    body.dev-mode section::before {
      content: attr(id);
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(29, 205, 159, 0.9);
      color: white;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: monospace;
      z-index: 100;
      text-transform: uppercase;
    }
  </style>
</head>
<body class="antialiased ${theme.bg} ${theme.text}">
${bodyContent}
</body>
</html>`
}

/**
 * Main sanitization pipeline
 */
export function sanitizeAndEnhanceHtml(
  rawHtml: string,
  templateId: number,
  businessName: string
): { html: string; metadata: { sections: string[]; colorScheme: string } } {
  // Step 1: Clean markdown artifacts
  let cleaned = rawHtml.trim()
  cleaned = cleaned.replace(/```html\n?/gi, '')
  cleaned = cleaned.replace(/```\n?$/g, '')
  cleaned = cleaned.replace(/^```/gm, '')
  
  // Step 2: Normalize dangerous color combinations
  cleaned = normalizeColorClasses(cleaned)
  
  // Step 3: Ensure all required sections exist
  cleaned = ensureRequiredSections(cleaned, businessName)
  
  // Step 4: Detect sections and color scheme
  const sections: string[] = []
  const lowerHtml = cleaned.toLowerCase()
  if (lowerHtml.includes('hero')) sections.push('hero')
  if (lowerHtml.includes('about')) sections.push('about')
  if (lowerHtml.includes('feature') || lowerHtml.includes('service')) sections.push('features')
  if (lowerHtml.includes('testimonial') || lowerHtml.includes('review')) sections.push('testimonials')
  if (lowerHtml.includes('cta') || lowerHtml.includes('contact')) sections.push('cta')
  if (lowerHtml.includes('footer')) sections.push('footer')
  
  const colorScheme = detectColorScheme(cleaned)
  
  // Step 5: Wrap in safety shell if not a complete document
  const hasDoctype = cleaned.includes('<!DOCTYPE')
  if (!hasDoctype) {
    cleaned = wrapInSafetyShell(cleaned, templateId, businessName, { colorScheme })
  }
  
  return {
    html: cleaned,
    metadata: {
      sections,
      colorScheme,
    },
  }
}

function detectColorScheme(html: string): string {
  if (html.includes('bg-blue') || html.includes('text-blue')) return 'blue'
  if (html.includes('bg-purple') || html.includes('text-purple')) return 'purple'
  if (html.includes('bg-green') || html.includes('text-green')) return 'green'
  if (html.includes('bg-orange') || html.includes('text-orange')) return 'orange'
  if (html.includes('bg-pink') || html.includes('text-pink')) return 'pink'
  return 'mixed'
}

