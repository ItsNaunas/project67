# AI Website Generation System

## Overview

This system generates production-ready websites using GPT-4 and a sophisticated safety/validation pipeline that ensures every website is readable, responsive, and conversion-optimized.

## Architecture Flow

```
User Input → API Route → Generator → GPT-4 → Raw HTML → Sanitizer → Safe HTML → Database → Viewer
```

### 1. System Prompt (`prompts/website_templates.txt`)
- Defines 8 template styles with detailed specifications
- Includes critical rules for color contrast, semantic HTML, and CTAs
- Enforces section requirements and responsive design patterns

### 2. Generator (`websiteGenerator.ts`)
- Loads system prompt and constructs user prompt with business data
- Calls GPT-4 with temperature 0.7 and max 8000 tokens
- Passes raw HTML through sanitization pipeline

### 3. HTML Sanitizer (`websiteHtmlSanitizer.ts`)
**Self-Healing Pipeline:**

#### Theme Safety System
- 8 template-specific theme configurations with safe color pairings
- CSS variables for consistent theming across templates
- Google Fonts injection for visual consistency

#### Color Normalization
- Detects and fixes dangerous class combinations (white-on-white, black-on-black)
- Removes global text-white from body/html to prevent cascade issues
- Ensures minimum contrast ratios

#### Section Validation
- Checks for 5 required sections: hero, about, features, cta, footer
- Auto-generates fallback sections if missing
- Ensures proper semantic HTML structure

#### Safety Shell
- Wraps partial/incomplete HTML in valid document structure
- Injects Tailwind CDN, Google Fonts, and theme CSS
- Adds dev mode styling for section boundary visualization

### 4. Database Storage
Stored in `generations` table as JSONB:
```json
{
  "templateId": 1,
  "html": "<!DOCTYPE html>...",
  "css": "",
  "metadata": {
    "templateId": 1,
    "templateName": "Luxury Minimalist",
    "sections": ["hero", "about", "features", "cta", "footer"],
    "colorScheme": "blue",
    "themeMode": "light"
  }
}
```

### 5. Website Viewer (`pages/website/[id].tsx`)
- Renders HTML using `dangerouslySetInnerHTML`
- Includes dev mode toggle for section boundary visualization
- Provides download functionality for generated HTML
- Shows section count and quality metrics

## Theme Configurations

Each template has a defined theme:

| Template ID | Name | Mode | Background | Text Color |
|-------------|------|------|------------|------------|
| 1 | Luxury Minimalist | light | white | gray-900 |
| 2 | Bold & Modern | dark | gradient blue-purple | white |
| 3 | Playful Creative | light | gradient orange-pink | gray-800 |
| 4 | Professional Corporate | light | white | gray-700 |
| 5 | Wellness & Lifestyle | light | stone-50 | gray-700 |
| 6 | E-commerce Pro | light | white | gray-800 |
| 7 | Agency Portfolio | dark | black | gray-200 |
| 8 | SaaS Landing | light | white | gray-700 |

## Dev Mode Features

Toggle dev mode in the website viewer to:
- See section boundaries outlined with dashed borders
- View section IDs in the top-left corner of each section
- Confirm all required sections are present
- Check section count and composition

## Quality Guarantees

The system ensures:
- ✅ Readable text contrast on all sections
- ✅ All 5 required sections present (with fallbacks)
- ✅ Semantic HTML5 structure
- ✅ Mobile-responsive design
- ✅ At least 2 clear CTAs
- ✅ Proper fonts and styling
- ✅ Valid HTML document structure

## Extending the System

### Adding a New Template
1. Add template config to `TEMPLATE_THEMES` in `websiteHtmlSanitizer.ts`
2. Add template spec to `website_templates.txt`
3. Update `getTemplateConfig()` in `websiteGenerator.ts`
4. Add template preview in `WebsiteTab.tsx`

### Modifying Safety Rules
Edit `websiteHtmlSanitizer.ts`:
- `UNSAFE_CLASS_PATTERNS`: Add new dangerous combinations
- `normalizeColorClasses()`: Modify normalization logic
- `generateThemeVariables()`: Adjust CSS variables
- `createFallbackSection()`: Customize fallback content

### Adjusting GPT Behavior
Edit `website_templates.txt`:
- Add new constraints in "CRITICAL RULES" section
- Modify template specifications
- Adjust content quality standards

## Testing

Generate websites for all 8 templates and verify:
1. Run generation for each template ID (1-8)
2. Enable dev mode and check section count
3. Test on mobile (375px) and desktop (1440px)
4. Verify text is readable on all sections
5. Confirm CTAs are visible and clickable
6. Download HTML and open in browser (should work standalone)

## Troubleshooting

**White text on white background:**
- Check `UNSAFE_CLASS_PATTERNS` catches the combination
- Verify template theme in `TEMPLATE_THEMES`
- Ensure section uses proper bg-* and text-* pairing

**Missing sections:**
- Fallbacks auto-generate in `ensureRequiredSections()`
- Check if section IDs are properly set
- Verify GPT prompt includes section requirements

**Fonts not loading:**
- Confirm `injectFonts()` adds Google Fonts link
- Check `wrapInSafetyShell()` includes fonts in <head>
- Verify Internet connection for CDN fonts

## Performance Notes

- Average generation time: 30-60 seconds
- HTML size: 50-150KB typical
- GPT-4 tokens used: 6000-8000 per website
- Database storage: JSONB in PostgreSQL (efficient)

## API Usage

### Generate Website
```typescript
POST /api/generate
{
  "dashboardId": "uuid",
  "type": "website",
  "templateId": 1-8
}
```

### Response
```typescript
{
  "content": "JSON string with html, css, metadata",
  "generation": {
    "id": "uuid",
    "dashboard_id": "uuid",
    "type": "website",
    "content": {...},
    "version": 1,
    "created_at": "timestamp"
  }
}
```

## Security Considerations

1. **Input Validation**: All inputs validated via Zod schemas
2. **Authentication**: User must be authenticated to generate
3. **Ownership**: User must own the dashboard
4. **HTML Safety**: Sanitization removes dangerous patterns
5. **Rate Limiting**: Enforced at application level

## File Structure

```
lib/ai/
├── businessCase.ts          # Business case generator
├── contentStrategy.ts       # Content strategy generator
├── websiteGenerator.ts      # Website generator (main)
├── websiteHtmlSanitizer.ts  # HTML sanitization pipeline
├── prompts/
│   ├── business_case.txt
│   ├── content_strategy.txt
│   └── website_templates.txt # System prompt for websites
└── README.md                 # This file
```

## Backward Compatibility

All changes are backward compatible:
- Existing websites render correctly
- New metadata fields are optional
- Old JSONB records still work
- Fallback values for missing data

## Future Enhancements

Potential improvements:
- Visual editor for generated websites
- Custom color scheme selector
- Template customization options
- A/B testing capabilities
- SEO optimization features
- Accessibility checker
- Performance optimization tools

