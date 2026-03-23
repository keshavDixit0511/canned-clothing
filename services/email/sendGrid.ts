// services/email/sendGrid.ts

/**
 * Email service using SendGrid.
 * Install: bun add @sendgrid/mail
 * Env: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME
 */

interface EmailOptions {
  to:       string
  subject:  string
  html:     string
  text?:    string
}

interface OrderEmailData {
  userName:    string
  orderId:     string
  totalAmount: number
  items: {
    name:     string
    quantity: number
    price:    number
  }[]
  shippingName:    string
  shippingAddr:    string
  shippingCity:    string
  shippingState:   string
  shippingZip:     string
}

// ─── Core send function ───────────────────────────────────────────────────────

async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey   = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "hello@alumandearth.com"
  const fromName  = process.env.SENDGRID_FROM_NAME  ?? "ALUM & EARTH"

  if (!apiKey) {
    console.warn("[SendGrid] SENDGRID_API_KEY not set — email not sent")
    console.log("[SendGrid] Would have sent:", { to: options.to, subject: options.subject })
    return
  }

  const { default: sgMail } = await import("@sendgrid/mail")
  sgMail.setApiKey(apiKey)

  await sgMail.send({
    to:      options.to,
    from:    { email: fromEmail, name: fromName },
    subject: options.subject,
    html:    options.html,
    text:    options.text ?? options.html.replace(/<[^>]+>/g, ""),
  })
}

// ─── Email templates ──────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount)
}

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: 'DM Sans', Arial, sans-serif; background: #0a0f0a; color: #e5e5e5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; padding: 24px 0; border-bottom: 1px solid #1a2a1a; margin-bottom: 32px; }
        .brand { font-size: 22px; font-weight: 900; color: #34d399; letter-spacing: 0.1em; }
        .footer { text-align: center; padding-top: 32px; border-top: 1px solid #1a2a1a; color: #4b5563; font-size: 12px; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">ALUM & EARTH — DK</div>
          <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">Wear it. Plant it. Grow it.</div>
        </div>
        ${content}
        <div class="footer">
          <p>© ${new Date().getFullYear()} ALUM & EARTH. All rights reserved.</p>
          <p>Made in India 🌱</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// ─── Email senders ────────────────────────────────────────────────────────────

/**
 * Welcome email after registration.
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = baseTemplate(`
    <h1 style="color: #34d399; font-size: 28px; margin-bottom: 16px;">Welcome, ${name}! 🌱</h1>
    <p style="color: #9ca3af; line-height: 1.6;">
      You've joined the ALUM & EARTH community. Every shirt you buy comes in a brushed aluminum tin
      with seeds inside — wear it, plant it, and track your plant's growth online.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_URL}/products"
        style="background: #059669; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Shop Your First Tin →
      </a>
    </div>
  `)

  await sendEmail({ to, subject: "Welcome to ALUM & EARTH 🌱", html })
}

/**
 * Order confirmation email.
 */
export async function sendOrderConfirmationEmail(
  to:   string,
  data: OrderEmailData
): Promise<void> {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 8px 0; color: #d1d5db;">${item.name}</td>
      <td style="padding: 8px 0; color: #9ca3af; text-align: center;">×${item.quantity}</td>
      <td style="padding: 8px 0; color: #34d399; text-align: right;">${formatINR(item.price * item.quantity)}</td>
    </tr>
  `).join("")

  const html = baseTemplate(`
    <h2 style="color: #34d399; margin-bottom: 8px;">Order Confirmed! 🎉</h2>
    <p style="color: #9ca3af;">Hi ${data.userName}, your order has been placed successfully.</p>

    <div style="background: #111811; border: 1px solid #1a2a1a; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px;">Order ID</p>
      <p style="color: white; font-size: 18px; font-weight: 700; margin: 0;">#${data.orderId.slice(-8).toUpperCase()}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemsHtml}
      <tr style="border-top: 1px solid #1a2a1a;">
        <td colspan="2" style="padding: 12px 0; color: #9ca3af; font-weight: 700;">Total</td>
        <td style="padding: 12px 0; color: #34d399; font-weight: 700; text-align: right;">${formatINR(data.totalAmount)}</td>
      </tr>
    </table>

    <div style="background: #111811; border: 1px solid #1a2a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Shipping To</p>
      <p style="color: #d1d5db; margin: 0;">${data.shippingName}</p>
      <p style="color: #9ca3af; margin: 4px 0 0; font-size: 14px;">
        ${data.shippingAddr}, ${data.shippingCity}, ${data.shippingState} — ${data.shippingZip}
      </p>
    </div>

    <div style="background: #052e16; border: 1px solid #166534; border-radius: 12px; padding: 16px; text-align: center;">
      <p style="color: #34d399; margin: 0; font-size: 14px;">
        🌱 When your tin arrives, scan the QR code to plant your seed and earn Green Points!
      </p>
    </div>
  `)

  await sendEmail({ to, subject: `Order Confirmed — #${data.orderId.slice(-8).toUpperCase()}`, html })
}

/**
 * Order shipped email.
 */
export async function sendOrderShippedEmail(
  to:          string,
  userName:    string,
  orderId:     string,
  trackingUrl?: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="color: #38bdf8; margin-bottom: 8px;">Your tin is on its way! 📦</h2>
    <p style="color: #9ca3af;">Hi ${userName}, order <strong style="color: white;">#${orderId.slice(-8).toUpperCase()}</strong> has been shipped.</p>
    ${trackingUrl ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${trackingUrl}"
        style="background: #0369a1; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Track Your Order →
      </a>
    </div>` : ""}
    <p style="color: #6b7280; font-size: 14px;">Get ready to wear it, plant it, and grow it. 🌱</p>
  `)

  await sendEmail({ to, subject: `Your tin is on its way — #${orderId.slice(-8).toUpperCase()}`, html })
}

/**
 * Password reset email.
 */
export async function sendPasswordResetEmail(
  to:        string,
  resetLink: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="color: white; margin-bottom: 8px;">Reset Your Password</h2>
    <p style="color: #9ca3af;">Click the button below to reset your password. This link expires in 1 hour.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}"
        style="background: #059669; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Reset Password →
      </a>
    </div>
    <p style="color: #6b7280; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
  `)

  await sendEmail({ to, subject: "Reset your ALUM & EARTH password", html })
}