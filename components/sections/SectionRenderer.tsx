import type { Section } from '@/lib/layout/schema'
import clsx from 'clsx'

interface SectionRendererProps {
  section: Section
}

export function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} />
    case 'feature-grid':
    case 'value-prop':
      return <FeatureSection section={section} />
    case 'testimonial':
      return <TestimonialSection section={section} />
    case 'pricing':
      return <PricingSection section={section} />
    case 'faq':
      return <FaqSection section={section} />
    case 'cta':
      return <CtaSection section={section} />
    case 'footer':
      return <FooterSection section={section} />
    default:
      return <RawSection section={section} />
  }
}

function HeroSection({ section }: { section: Section }) {
  const heading = getTextField(section, 'heading', 'Build something remarkable')
  const body = getRichTextField(section, 'body', 'Describe your hero message here.')
  const cta = getLinkField(section, 'primaryCta')
  const image = getImageField(section, 'image')

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/20 via-transparent to-transparent py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            Featured section
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
            {heading}
          </h1>
          <p className="max-w-2xl text-base text-white/70 md:text-lg">{body}</p>
          {cta ? (
            <a
              href={cta.href || '#'}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-white/80"
            >
              {cta.text}
            </a>
          ) : null}
        </div>
        {image ? (
          <div className="flex-1">
            <img
              src={image.url}
              alt={image.alt}
              className="w-full rounded-3xl border border-white/10 shadow-xl"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}

function FeatureSection({ section }: { section: Section }) {
  const heading = getTextField(section, 'heading', section.label)
  const body = getRichTextField(section, 'body', '')
  const features = section.blocks.length > 0 ? section.blocks : defaultFeatureBlocks()

  return (
    <section className="bg-white py-20 text-gray-900">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold">{heading}</h2>
          {body ? <p className="mt-4 text-lg text-gray-600">{body}</p> : null}
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
                {getFieldValue(feature.fields, 'tagline', 'Feature')}
              </p>
              <h3 className="mt-3 text-xl font-semibold">
                {getFieldValue(feature.fields, 'title', feature.label)}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {getFieldValue(feature.fields, 'description', 'Add feature details')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialSection({ section }: { section: Section }) {
  const heading = getTextField(section, 'heading', 'What clients say')
  const testimonials = section.blocks.length > 0 ? section.blocks : defaultTestimonialBlocks()

  return (
    <section className="bg-gray-900 py-20">
      <div className="mx-auto max-w-5xl px-6 text-center text-white">
        <h2 className="font-display text-3xl font-semibold">{heading}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-lg"
            >
              <p className="text-sm text-white/80">
                {getFieldValue(testimonial.fields, 'quote', 'Incredible experience.')}
              </p>
              <div className="mt-6">
                <p className="text-sm font-semibold">
                  {getFieldValue(testimonial.fields, 'name', 'Happy Client')}
                </p>
                <p className="text-xs uppercase tracking-wide text-white/50">
                  {getFieldValue(testimonial.fields, 'role', 'Customer')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ section }: { section: Section }) {
  const heading = getTextField(section, 'heading', 'Pricing')
  const plans = section.blocks.length > 0 ? section.blocks : defaultPricingBlocks()

  return (
    <section className="bg-white py-20 text-gray-900">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center font-display text-3xl font-semibold">{heading}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={clsx(
                'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
                getFieldValue(plan.fields, 'featured', '') === 'true'
                  ? 'border-indigo-500 shadow-indigo-100'
                  : null
              )}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {getFieldValue(plan.fields, 'name', plan.label)}
              </p>
              <p className="mt-4 text-3xl font-bold">
                {getFieldValue(plan.fields, 'price', '$99')}
                <span className="text-sm font-normal text-gray-500">
                  {getFieldValue(plan.fields, 'billing', '/mo')}
                </span>
              </p>
              <p className="mt-4 text-sm text-gray-600">
                {getFieldValue(plan.fields, 'description', 'Add plan details')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ section }: { section: Section }) {
  const heading = getTextField(section, 'heading', 'Frequently asked questions')
  const faqs = section.blocks.length > 0 ? section.blocks : defaultFaqBlocks()

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center font-display text-3xl font-semibold text-gray-900">{heading}</h2>
        <div className="mt-10 space-y-6">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                {getFieldValue(faq.fields, 'question', faq.label)}
              </summary>
              <p className="mt-3 text-sm text-gray-600">
                {getFieldValue(faq.fields, 'answer', 'Add your answer here')}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection({ section }: { section: Section }) {
  const heading = getTextField(section, 'heading', 'Ready to get started?')
  const body = getRichTextField(section, 'body', 'Reach out to us to begin your journey.')
  const cta = getLinkField(section, 'primaryCta') ?? { href: '#', text: 'Contact us', style: 'primary' }

  return (
    <section className="bg-gradient-to-br from-indigo-600 to-purple-600 py-16 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-3xl font-semibold">{heading}</h2>
        <p className="mt-4 text-lg text-white/80">{body}</p>
        <a
          href={cta.href}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wide text-indigo-600 transition hover:bg-white/90"
        >
          {cta.text}
        </a>
      </div>
    </section>
  )
}

function FooterSection({ section }: { section: Section }) {
  const body = getRichTextField(section, 'body', '© Your company. All rights reserved.')

  return (
    <footer className="bg-gray-900 py-10 text-white/70">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-sm">{body}</p>
      </div>
    </footer>
  )
}

function RawSection({ section }: { section: Section }) {
  const html = getRichTextField(section, 'rawHtml', '')
  return (
    <section
      className="relative bg-white py-16 text-gray-900"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function getTextField(section: Section, key: string, fallback: string): string {
  const field = section.fields.find((item) => item.kind === 'text' && item.key === key)
  return field && field.kind === 'text' ? field.value ?? fallback : fallback
}

function getRichTextField(section: Section, key: string, fallback: string): string {
  const field = section.fields.find((item) => item.kind === 'richText' && item.key === key)
  return field && field.kind === 'richText' ? field.markdown ?? fallback : fallback
}

function getLinkField(section: Section, key: string) {
  const field = section.fields.find((item) => item.kind === 'link' && item.key === key)
  return field && field.kind === 'link' ? field : null
}

function getImageField(section: Section, key: string) {
  const field = section.fields.find((item) => item.kind === 'image' && item.key === key)
  return field && field.kind === 'image' ? field : null
}

function getFieldValue(fields: Array<{ kind: string; key: string; [key: string]: unknown }>, key: string, fallback: string) {
  const field = fields.find((item) => item.key === key)
  if (!field) return fallback
  if (field.kind === 'text' && 'value' in field) return (field.value as string) ?? fallback
  if (field.kind === 'richText' && 'markdown' in field) return (field.markdown as string) ?? fallback
  return fallback
}

function defaultFeatureBlocks() {
  return [
    {
      id: 'feature-1',
      label: 'Feature one',
      sortOrder: 0,
      fields: [
        { kind: 'text', key: 'tagline', label: 'Tagline', value: 'Quality', multiline: false },
        { kind: 'text', key: 'title', label: 'Title', value: 'Premium experience', multiline: false },
        {
          kind: 'richText',
          key: 'description',
          label: 'Description',
          markdown: 'Deliver premium value with every interaction.',
        },
      ],
    },
  ]
}

function defaultTestimonialBlocks() {
  return [
    {
      id: 'testimonial-1',
      label: 'Testimonial',
      sortOrder: 0,
      fields: [
        {
          kind: 'richText',
          key: 'quote',
          label: 'Quote',
          markdown: 'This service transformed our business.',
        },
        { kind: 'text', key: 'name', label: 'Name', value: 'Jordan Wells', multiline: false },
        { kind: 'text', key: 'role', label: 'Role', value: 'Founder, Horizon', multiline: false },
      ],
    },
  ]
}

function defaultPricingBlocks() {
  return [
    {
      id: 'pricing-1',
      label: 'Basic',
      sortOrder: 0,
      fields: [
        { kind: 'text', key: 'name', label: 'Name', value: 'Starter', multiline: false },
        { kind: 'text', key: 'price', label: 'Price', value: '$49', multiline: false },
        { kind: 'text', key: 'billing', label: 'Billing', value: '/mo', multiline: false },
        {
          kind: 'richText',
          key: 'description',
          label: 'Description',
          markdown: 'Great for early-stage teams getting started.',
        },
      ],
    },
  ]
}

function defaultFaqBlocks() {
  return [
    {
      id: 'faq-1',
      label: 'FAQ Item',
      sortOrder: 0,
      fields: [
        { kind: 'text', key: 'question', label: 'Question', value: 'How do I get started?', multiline: false },
        {
          kind: 'richText',
          key: 'answer',
          label: 'Answer',
          markdown: 'Simply reach out to our team and we will guide you through onboarding.',
        },
      ],
    },
  ]
}


