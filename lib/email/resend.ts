import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email notifications will not work.')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: 'Project 67 <hello@project67.com>',
      to,
      subject: 'Welcome to Project 67 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #296AFF;">Welcome to Project 67, ${name}!</h1>
          <p>You're now part of an exclusive community building the next generation of 6-7 figure businesses.</p>
          <h2>What's Next?</h2>
          <ul>
            <li>Complete your business case generation</li>
            <li>Create your viral content strategy</li>
            <li>Choose your website template</li>
            <li>Unlock unlimited access</li>
          </ul>
          <p>We'll send you weekly viral content ideas and progress updates to keep you on track.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #296AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Go to Dashboard
          </a>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

export async function sendCompletionNudge(to: string, name: string, missingSteps: string[]) {
  try {
    await resend.emails.send({
      from: 'Project 67 <hello@project67.com>',
      to,
      subject: "You're so close! Complete your business setup",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #296AFF;">Hey ${name}, finish what you started! 💪</h1>
          <p>You're just a few steps away from having your complete business blueprint.</p>
          <h2>What's left:</h2>
          <ul>
            ${missingSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>
          <p>Each step takes less than 5 minutes. Let's do this!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #296AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Complete Now
          </a>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending completion nudge:', error)
  }
}

export async function sendWeeklyViralIdeas(to: string, name: string, niche: string) {
  try {
    await resend.emails.send({
      from: 'Project 67 <hello@project67.com>',
      to,
      subject: '3 Viral Content Ideas for This Week 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #296AFF;">Your Weekly Content Boost, ${name}</h1>
          <p>Here are 3 fresh content ideas tailored for ${niche}:</p>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>Idea #1: The Transformation Hook</h3>
            <p>"I went from [struggle] to [success] in [timeframe]. Here's exactly what I did..."</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>Idea #2: The Mistake Reveal</h3>
            <p>"5 mistakes that cost me [money/time] in ${niche} (and how to avoid them)"</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>Idea #3: The Behind-The-Scenes</h3>
            <p>"A day in the life of running a [X]-figure ${niche} business (the truth nobody shows)"</p>
          </div>
          
          <p>Use these as templates and make them your own!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #296AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            View Full Strategy
          </a>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending weekly viral ideas:', error)
  }
}

export async function sendPurchaseConfirmation(to: string, name: string) {
  try {
    await resend.emails.send({
      from: 'Project 67 <hello@project67.com>',
      to,
      subject: 'Welcome to the 67 Club! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #B48A39;">Congratulations, ${name}! 👑</h1>
          <p>You're now a premium member of Project 67. Your journey to 6/7 figures just got serious.</p>
          
          <h2>You Now Have:</h2>
          <ul>
            <li>✅ Unlimited AI regenerations</li>
            <li>✅ Full dashboard access</li>
            <li>✅ Weekly viral content ideas</li>
            <li>✅ Priority support</li>
            <li>✅ Referral program (earn £16.75 per sale)</li>
          </ul>
          
          <p>Your referral link is in your dashboard. Share it and earn 50% commission!</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #296AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Go to Dashboard
          </a>
          
          <p style="margin-top: 32px; color: #666; font-size: 14px;">
            Need help? Reply to this email or contact support@project67.com
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending purchase confirmation:', error)
  }
}

