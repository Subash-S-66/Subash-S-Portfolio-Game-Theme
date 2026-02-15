import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { body, validationResult } from 'express-validator'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Always log port information for debugging
console.log(`🔧 Environment PORT: ${process.env.PORT}`)
console.log(`🔧 Using PORT: ${PORT}`)
console.log(`🔧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'SET' : 'NOT SET'}`)
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`)

// Trust proxy for rate limiting (required for Render.com)
app.set('trust proxy', 1)

// Resolve __dirname for ESM so static files are served relative to this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
// Helmet + CSP: allow Zeabur host and Google Fonts for styles and fonts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Allow stylesheet links (external and element-level) from known deployment hosts and Google Fonts
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        process.env.CLIENT_URL || 'https://subash-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app',
        process.env.GITHUB_PAGES_URL || 'https://subash-s-66.github.io'
      ],
      styleSrcElem: [
        "'self'",
        "https://fonts.googleapis.com",
        process.env.CLIENT_URL || 'https://subash-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app',
        process.env.GITHUB_PAGES_URL || 'https://subash-s-66.github.io'
      ],
      // Allow scripts from self; keep unsafe-inline/eval to support some libs if needed
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      // Allow API connections from the app origin (Zeabur) and any configured API URL
      connectSrc: [
        "'self'",
        process.env.API_URL || process.env.CLIENT_URL || process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app'
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}))
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'https://subash-s-66.github.io/Subash-Portfolio',
    'https://subash-s-66.github.io',
    process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Contact form rate limiting (more restrictive)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact form submissions per windowMs
  message: 'Too many contact form submissions, please try again later.'
})

// Resend email configuration
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Nodemailer transporter (if SMTP env vars are provided)
let smtpTransporter = null
const usingSMTP = !!process.env.EMAIL_HOST && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD
if (usingSMTP) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

const sendEmailWithResend = async (to, subject, html, replyTo = null) => {
  if (!resend) throw new Error('Resend API key not configured')

  try {
    const emailData = {
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html
    }

    if (replyTo) {
      emailData.reply_to = replyTo
    }

    const result = await resend.emails.send(emailData)
    console.log('Resend email sent successfully:', result.data?.id)
    return result
  } catch (error) {
    console.error('Resend email sending failed:', error.message)
    throw error
  }
}

const sendEmailWithSMTP = async (to, subject, html, replyTo = null) => {
  if (!smtpTransporter) throw new Error('SMTP transporter not configured')

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  }

  if (replyTo) mailOptions.replyTo = replyTo

  const info = await smtpTransporter.sendMail(mailOptions)
  console.log('SMTP email sent:', info.messageId)
  return info
}

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

// Debug endpoints (temporary) to help verify CSP and the served index
app.get('/_debug/csp', (req, res) => {
  const csp = res.getHeader('content-security-policy') || res.getHeader('Content-Security-Policy') || 'not-set'
  res.json({ csp })
})

app.get('/_debug/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString()
  })
})

// Contact form endpoint
app.post('/api/contact', 
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('subject')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Subject must be between 5 and 100 characters'),
    body('message')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { name, email, subject, message } = req.body

      // Build main notification HTML
      const mainEmailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact — Portfolio</title>
        </head>
        <body style="margin:0;padding:0;background-color:#08080f;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#c8ccd4;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#08080f;">
            <tr><td align="center" style="padding:40px 16px;">
              <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background-color:#0f0f18;border:1px solid #1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 0 80px rgba(255,45,85,0.06);">

                <!-- HEADER -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1a0a0a 0%,#1a0015 50%,#0a0a1a 100%);padding:40px;text-align:center;border-bottom:1px solid #2a1525;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                      <tr>
                        <td style="width:10px;height:10px;background-color:#ff2d55;border-radius:50%;box-shadow:0 0 12px #ff2d55,0 0 24px rgba(255,45,85,0.4);"></td>
                        <td style="padding-left:10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#ff2d55;font-weight:600;">INCOMING SIGNAL</td>
                      </tr>
                    </table>
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">New Contact Submission</h1>
                    <p style="margin:10px 0 0;font-size:14px;color:#6a5a6e;">A new message arrived from your portfolio.</p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:36px 40px;">

                    <!-- Sender Info Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#13132a;border:1px solid #1e1e3a;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:24px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td style="width:4px;background:linear-gradient(180deg,#00d4ff,#0088cc);border-radius:2px;"></td>
                              <td style="padding-left:14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00d4ff;font-weight:600;">SENDER PROFILE</td>
                            </tr>
                          </table>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:8px 0;color:#555a6e;font-size:12px;width:80px;vertical-align:top;letter-spacing:1px;">NAME</td>
                              <td style="padding:8px 0;color:#ffffff;font-size:15px;font-weight:600;">${name}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;color:#555a6e;font-size:12px;vertical-align:top;letter-spacing:1px;">EMAIL</td>
                              <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#00d4ff;text-decoration:none;font-size:15px;font-weight:500;">${email}</a></td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;color:#555a6e;font-size:12px;vertical-align:top;letter-spacing:1px;">SUBJECT</td>
                              <td style="padding:8px 0;color:#e0e0e8;font-size:15px;">${subject}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Message Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#13132a;border:1px solid #1e1e3a;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:24px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td style="width:4px;background:linear-gradient(180deg,#00ffa3,#00cc82);border-radius:2px;"></td>
                              <td style="padding-left:14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00ffa3;font-weight:600;">MESSAGE CONTENT</td>
                            </tr>
                          </table>
                          <div style="color:#b0b4c0;font-size:14px;line-height:1.8;white-space:pre-wrap;word-wrap:break-word;border-left:2px solid #2a2a4a;padding-left:16px;">${message.replace(/\n/g, '<br>')}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Timestamp -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0a1628,#0d1f3c);border:1px solid #1a3a5c;border-radius:12px;">
                      <tr>
                        <td style="padding:20px;text-align:center;">
                          <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#3a7abf;font-weight:600;">RECEIVED</span>
                          <div style="font-size:14px;color:#7aaed4;margin-top:6px;">${new Date().toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short'
                          })}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Quick Reply -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                      <tr>
                        <td align="center">
                          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#00d4ff,#0088cc);color:#000000;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.5px;">Reply to ${name}</a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color:#0a0a14;border-top:1px solid #1a1a2e;padding:24px 40px;text-align:center;">
                    <div style="font-size:12px;color:#3a3a5e;">Portfolio contact notification &bull; <a href="https://subash.zeabur.app" style="color:#555a6e;text-decoration:none;">subash.zeabur.app</a></div>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `

      // Auto-reply HTML (dark gaming-themed template)
      const autoReplyHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transmission Received — Subash S</title>
        </head>
        <body style="margin:0;padding:0;background-color:#08080f;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#c8ccd4;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#08080f;">
            <tr><td align="center" style="padding:40px 16px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f0f18;border:1px solid #1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 0 60px rgba(0,212,255,0.08);">

                <!-- ═══ HEADER ═══ -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0d0d1a 0%,#12122a 100%);padding:48px 40px 40px;text-align:center;border-bottom:1px solid #1a1a2e;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                      <tr>
                        <td style="width:10px;height:10px;background-color:#00ffa3;border-radius:50%;box-shadow:0 0 12px #00ffa3,0 0 24px rgba(0,255,163,0.4);"></td>
                        <td style="padding-left:10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#00ffa3;font-weight:600;">TRANSMISSION RECEIVED</td>
                      </tr>
                    </table>
                    <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Thank You for Reaching Out</h1>
                    <p style="margin:12px 0 0;font-size:15px;color:#7a7f8e;line-height:1.5;">Your message has been logged. I'll respond within 24–48 hours.</p>
                  </td>
                </tr>

                <!-- ═══ CONTENT ═══ -->
                <tr>
                  <td style="padding:36px 40px;">

                    <!-- Message Summary Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#13132a;border:1px solid #1e1e3a;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:24px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td style="width:4px;background:linear-gradient(180deg,#00d4ff,#0088cc);border-radius:2px;"></td>
                              <td style="padding-left:14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00d4ff;font-weight:600;">MESSAGE LOG</td>
                            </tr>
                          </table>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:8px 0;color:#555a6e;font-size:12px;width:90px;vertical-align:top;letter-spacing:1px;">SUBJECT</td>
                              <td style="padding:8px 0;color:#e0e0e8;font-size:14px;font-weight:500;">${subject}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;color:#555a6e;font-size:12px;vertical-align:top;letter-spacing:1px;">RECEIVED</td>
                              <td style="padding:8px 0;color:#e0e0e8;font-size:14px;">${new Date().toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Your Message Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#13132a;border:1px solid #1e1e3a;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:24px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td style="width:4px;background:linear-gradient(180deg,#a855f7,#7c3aed);border-radius:2px;"></td>
                              <td style="padding-left:14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a855f7;font-weight:600;">YOUR MESSAGE</td>
                            </tr>
                          </table>
                          <div style="color:#b0b4c0;font-size:14px;line-height:1.7;white-space:pre-line;border-left:2px solid #2a2a4a;padding-left:16px;">${message.replace(/\n/g, '<br>')}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Response ETA Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%);border:1px solid #1a3a5c;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:24px;text-align:center;">
                          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00d4ff;font-weight:600;margin-bottom:8px;">&#9201; ESTIMATED RESPONSE</div>
                          <div style="font-size:28px;font-weight:700;color:#ffffff;margin-bottom:4px;">24 – 48 hrs</div>
                          <div style="font-size:13px;color:#5a7a9e;">For urgent matters, reply directly to this thread.</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Connect Buttons -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#555a6e;font-weight:600;">CONNECT WITH ME</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right:10px;">
                                <a href="https://www.linkedin.com/in/subash-s-514aa9373" target="_blank" style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#0077b5,#005e93);color:#ffffff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.5px;">LinkedIn</a>
                              </td>
                              <td style="padding-right:10px;">
                                <a href="https://github.com/Subash-S-66" target="_blank" style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#2a2a3e,#1a1a2e);color:#e0e0e8;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.5px;border:1px solid #3a3a5e;">GitHub</a>
                              </td>
                              <td>
                                <a href="https://subash.zeabur.app" target="_blank" style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#00d4ff,#0088cc);color:#000000;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.5px;">Portfolio</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- ═══ FOOTER ═══ -->
                <tr>
                  <td style="background-color:#0a0a14;border-top:1px solid #1a1a2e;padding:32px 40px;text-align:center;">
                    <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">SUBASH S</div>
                    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#00d4ff;margin-top:6px;font-weight:500;">Full-Stack Developer</div>
                    <div style="width:40px;height:2px;background:linear-gradient(90deg,#00d4ff,#a855f7);margin:16px auto;border-radius:1px;"></div>
                    <div style="font-size:13px;color:#555a6e;line-height:1.6;">
                      B.Tech Computer Science &bull; Chennai, India<br>
                      <a href="mailto:${process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'}" style="color:#7a7f8e;text-decoration:none;">${process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'}</a>
                    </div>
                    <div style="margin-top:20px;font-size:11px;color:#3a3a5e;">
                      This is an automated response from the portfolio contact system.
                    </div>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `

      // Where to send the admin notification
      const notificationEmail = process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'

      // Send notification to admin using SMTP if configured, otherwise try Resend
      if (usingSMTP) {
        // Send notification to admin
        await sendEmailWithSMTP(notificationEmail, `Portfolio Contact: ${subject}`, mainEmailHtml, email)
        // Send auto-reply to sender via SMTP (not third-party)
        try {
          await sendEmailWithSMTP(email, `Thank you for contacting me - ${subject}`, autoReplyHtml, notificationEmail)
        } catch (err) {
          console.warn('Auto-reply failed (SMTP):', err.message)
        }
      } else if (process.env.RESEND_API_KEY) {
        // Send notification via Resend (only admin, no auto-reply to avoid third-party for sender)
        await sendEmailWithResend(notificationEmail, `Portfolio Contact: ${subject}`, mainEmailHtml, email)
        console.log('Auto-reply not sent to sender (Resend is third-party service)')
      } else {
        console.log('No email service configured. Message received but not sent via email.')
        console.log('Name:', name, 'Email:', email, 'Subject:', subject, 'Message:', message)
      }

      res.json({
        success: true,
        message: 'Message received! I\'ll get back to you soon.'
      })

    } catch (error) {
      console.error('Contact form error:', error.message)
      
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      })
    }
  }
)

// Portfolio data endpoint
app.get('/api/portfolio', (req, res) => {
  const portfolioData = {
    personal: {
      name: 'Subash S',
      title: 'B.Tech Computer Science Student',
      subtitle: 'Full Stack Developer using MERN Stack',
      email: 'your-email@gmail.com',
      phone: '+91-9345081127',
      location: 'Chennai, India',
      github: 'https://github.com/Subash-S-66',
      linkedin: 'https://www.linkedin.com/in/subash-s-514aa9373'
    },
    about: {
      summary: 'Computer Science Engineering student with practical experience in full-stack web development, focusing on the MERN stack (using MySQL instead of MongoDB). Currently doing an internship at Postulate Info Tech, contributing to real-world projects.',
      cgpa: '7.7/10',
      university: 'Dr.M.G.R. Educational and Research Institute, Chennai',
      graduationYear: '2022-2026'
    },
    skills: {
      programming: ['JavaScript', 'Python'],
      frontend: ['React.js', 'Node.js', 'Express.js', 'HTML', 'CSS', 'Tailwind CSS'],
      database: ['MySQL','PostgreSQL','MongoDB'],
      tools: ['Git', 'GitHub'],
      softSkills: ['Problem Solving', 'Teamwork', 'Communication']
    },
    languages: [
      { name: 'English', level: 'Fluent' },
      { name: 'Tamil', level: 'Fluent' },
      { name: 'Hindi', level: 'Basics' }
    ]
  }

  res.json(portfolioData)
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  })
})

// Serve static files from the React app build directory (relative to this file)
app.use(express.static(path.join(__dirname, 'dist')))
// Also serve the same build when the app is hosted under a subpath (Zeabur uses /projects)
app.use('/projects', express.static(path.join(__dirname, 'dist')))
// Serve Android APK files from the root-level "Android app" folder
app.use('/apk', express.static(path.join(__dirname, '..', 'Android app')))
app.use('/projects/apk', express.static(path.join(__dirname, '..', 'Android app')))

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // If the request starts with the Zeabur subpath, ensure we return the built index
  // so relative asset links resolve under /projects/* correctly.
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
