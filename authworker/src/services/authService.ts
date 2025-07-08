// src/services/authService.ts
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { getInventoryService } from './getInventoryService'
import type { Context } from 'hono'

// Bindings type for environment variables and DB access
type Bindings = {
  DB: D1Database
  SENDGRID_API_KEY: string
  SENDER_EMAIL: string
  BASE_URL: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Hash password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Validate password strength (min 8 chars, uppercase, symbol)
function validatePassword(password: string): boolean {
  const re = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/
  return re.test(password)
}

// Generate random token (default length 48)
function generateToken(length = 48): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Send email via SendGrid API
async function sendEmail(
  c: Context<{ Bindings: Bindings }>,
  toEmail: string,
  subject: string,
  text: string,
  html: string
) {
  const body = {
    personalizations: [{ to: [{ email: toEmail }] }],
    from: { email: c.env.SENDER_EMAIL, name: 'Speas.org' },
    subject,
    content: [
      { type: 'text/plain', value: text },
      { type: 'text/html', value: html },
    ],
  }
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`SendGrid error: ${await res.text()}`)
}

// ─── Route Handlers ─────────────────────────────────────────────────────────

// User signup handler: validate, create user, send verification email
export async function signup(c: Context<{ Bindings: Bindings }>) {
  const { password, name } = await c.req.json();
  const email = (await c.req.json()).email?.toLowerCase();
  if (!email || !password) return c.json({ message: 'Missing fields' }, 400)
  if (!validatePassword(password))
    return c.json(
      {
        message:
          'Password must be at least 8 characters long, contain an uppercase letter and a symbol',
      },
      400
    )

  // Check if user exists
  const exists = await c.env.DB.prepare('SELECT 1 FROM users WHERE email = ?')
    .bind(email)
    .first()
  if (exists) return c.json({ message: 'User already exists' }, 400)

  // Hash password, create verification token with expiry
  const password_hash = await hashPassword(password)
  const verification_token = generateToken()
  const verification_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

 // Insert new user (email_verified false)
await c.env.DB
  .prepare(
    `INSERT INTO users
     (email,password_hash,name,email_verified,verification_token,verification_token_expiry)
     VALUES (?,?,?,?,?,?)`
  )
  .bind(email, password_hash, name || null, 0, verification_token, verification_token_expiry)
  .run()

// Get the new user's id
const userRow = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
const userId = userRow?.id

if (userId) {
  // Gear and bait stats from seed data
  const rustyRodStats = JSON.stringify({ focus: 25, lineTension: 25, luck: 0 })
  const rustyHookStats = JSON.stringify({ focus: 25, lineTension: 25, luck: 0 })
  const brokenBaitStats = JSON.stringify({ focus: 10, lineTension: 10, luck: 0 })

  // Insert gear: rod
  await c.env.DB.prepare(
    `INSERT INTO gear (user_id, gear_type, type_id, stats) VALUES (?, 'rod', 1, ?)`
  ).bind(userId, rustyRodStats).run()

  // Insert gear: hook
  await c.env.DB.prepare(
    `INSERT INTO gear (user_id, gear_type, type_id, stats) VALUES (?, 'hook', 1, ?)`
  ).bind(userId, rustyHookStats).run()

  // Insert bait with quantity 10
  await c.env.DB.prepare(
    `INSERT INTO bait (user_id, type_id, quantity, stats) VALUES (?, 1, 10, ?)`
  ).bind(userId, brokenBaitStats).run()

  // Get the inserted gear and bait IDs to set as equipped
  const rod = await c.env.DB.prepare(
    `SELECT id FROM gear WHERE user_id = ? AND gear_type = 'rod' AND type_id = 1`
  ).bind(userId).first()

  const hook = await c.env.DB.prepare(
    `SELECT id FROM gear WHERE user_id = ? AND gear_type = 'hook' AND type_id = 1`
  ).bind(userId).first()

  const bait = await c.env.DB.prepare(
    `SELECT id FROM bait WHERE user_id = ? AND type_id = 1`
  ).bind(userId).first()

  // Insert into equipped table
  await c.env.DB.prepare(
    `INSERT INTO equipped (user_id, equipped_rod_id, equipped_hook_id, equipped_bait_id)
     VALUES (?, ?, ?, ?)`
  ).bind(userId, rod?.id || null, hook?.id || null, bait?.id || null).run()
}


// Send verification email
const verificationUrl = `${c.env.BASE_URL}/verify-email?token=${verification_token}`;
  try {
    await sendEmail(
      c,
      email,
      'Welcome to Speas.org – Verify Your Email',
      `Hi ${name || ''},\n\nClick this link to verify your email: ${verificationUrl}`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #111;">Welcome to <span style="color: #6366f1;">Speas.org</span></h2>
        <p>Hi ${name || ''},</p>
        <p>Thanks for signing up. Please verify your email by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p><a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
        <hr />
        <p style="font-size: 12px; color: #999;">If you didn’t create an account, you can safely ignore this email.</p>
      </div>
      `
    );
  } catch (err) {
    console.error(err)
    return c.json({ message: 'Failed to send verification email' }, 500)
  }

  return c.json({ message: 'User created. Check your email to verify.' })
}

// Verify email using token, mark user as verified if valid
export async function verifyEmail(c: Context<{ Bindings: Bindings }>) {
  const token = c.req.query('token') as string | undefined
  if (!token) return c.json({ message: 'Missing token' }, 400)

  const row = (await c.env.DB
    .prepare(
      'SELECT email, email_verified, verification_token_expiry FROM users WHERE verification_token = ?'
    )
    .bind(token)
    .first()) as
    | { email: string; email_verified: number; verification_token_expiry: string }
    | undefined

  if (!row) return c.json({ message: 'Invalid token' }, 400)
  if (row.email_verified) return c.json({ message: 'Already verified' })
  if (new Date() > new Date(row.verification_token_expiry))
    return c.json({ message: 'Token expired' }, 400)

  // Update user as verified, clear token fields
  await c.env.DB
    .prepare(
      `UPDATE users
       SET email_verified = 1, verification_token = NULL, verification_token_expiry = NULL
       WHERE email = ?`
    )
    .bind(row.email)
    .run()
  return c.json({ message: 'Email verified successfully' })
}

// Login handler: verify credentials and email verification, set session cookie
export async function login(c: Context<{ Bindings: Bindings }>) {
  const { password, name } = await c.req.json();
  const email = (await c.req.json()).email?.toLowerCase();
  if (!email || !password)
    return c.json({ message: 'Missing credentials' }, 400)

  const user = (await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()) as
    | {
        email: string
        password_hash: string
        email_verified: number
      }
    | undefined

  if (!user)
    return c.json({ message: 'User not found' }, 401)

  if (!user.email_verified)
    return c.json({ message: 'Please verify your email before logging in' }, 401)

  const hash = await hashPassword(password)
  if (user.password_hash !== hash)
    return c.json({ message: 'Invalid credentials' }, 401)

  setCookie(c, 'session', btoa(email), {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return c.json({ message: 'Logged in' })
}

// Get current session: decode session cookie, return user email or null
export async function getSession(c: Context<{ Bindings: Bindings }>) {
  const session = getCookie(c, 'session')
  if (!session) return c.json({ user: null, inventory: [] })

  try {
    const email = atob(session)

    // Call your inventory service
    const inventoryResponse = await getInventoryService(c)

    // Check if inventory exists in the response
    const inventory =
      inventoryResponse && 'inventory' in inventoryResponse
        ? inventoryResponse.inventory
        : []

    return c.json({ user: { email }, inventory })
  } catch {
    return c.json({ user: null, inventory: [] })
  }
}

// Logout handler: delete session cookie
export async function logout(c: Context<{ Bindings: Bindings }>) {
  deleteCookie(c, 'session', { path: '/', secure: true, sameSite: 'Lax' })
  return c.json({ message: 'Logged out' })
}

// Request password reset: generate reset token, send reset email
export async function requestPasswordReset(c: Context<{ Bindings: Bindings }>) {
  const email = (await c.req.json()).email?.toLowerCase();
  if (!email) return c.json({ message: 'Email required' }, 400)
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
  if (!user) return c.json({ message: 'If email exists, a reset email was sent' })

  const token = generateToken()
  const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour expiry
  await c.env.DB
    .prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?')
    .bind(token, expiry, email)
    .run()

  // Send reset password email
  const resetUrl = `${c.env.BASE_URL}/reset-password?token=${token}`
  try {
    await sendEmail(
      c,
      email,
      'Password Reset Request - Speas.org',
      `Click this link to reset your password: ${resetUrl}`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #111;">Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p><a href="${resetUrl}" style="color: #6366f1;">${resetUrl}</a></p>
        <hr />
        <p style="font-size: 12px; color: #999;">If you didn’t request this email, you can safely ignore it.</p>
      </div>
      `
    );
  } catch (err) {
    console.error(err)
    return c.json({ message: 'Failed to send password reset email' }, 500)
  }
  return c.json({ message: 'If that email exists, a reset email was sent' })
}

// Reset password: verify token, validate new password, update hash
export async function resetPassword(c: Context<{ Bindings: Bindings }>) {
  const { token, newPassword } = await c.req.json()
  if (!token || !newPassword) return c.json({ message: 'Missing fields' }, 400)
  if (!validatePassword(newPassword))
    return c.json({ message: 'Password must be at least 8 characters long, contain at least one uppercase letter and one symbol' }, 400)

  const row = (await c.env.DB
    .prepare('SELECT email, reset_token_expiry FROM users WHERE reset_token = ?')
    .bind(token)
    .first()) as { email: string; reset_token_expiry: string } | undefined
  if (!row) return c.json({ message: 'Invalid or expired token' }, 400)
  const expiryDate = new Date(row.reset_token_expiry)
  if (new Date() > expiryDate) return c.json({ message: 'Token expired' }, 400)

  const hash = await hashPassword(newPassword)
  await c.env.DB
    .prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?')
    .bind(hash, row.email)
    .run()
  return c.json({ message: 'Password reset successful' })
}

// Resend email verification if user exists and unverified
export async function resendVerification(c: Context<{ Bindings: Bindings }>) {
  const email = (await c.req.json()).email?.toLowerCase();
  if (!email) return c.json({ message: 'Email required' }, 400)
  const user = (await c.env.DB.prepare('SELECT email,name,email_verified FROM users WHERE email = ?').bind(email).first()) as
    | { email: string; name: string | null; email_verified: number }
    | undefined
  if (!user || user.email_verified)
    return c.json({ message: 'If that email exists, a verification email was sent' })

  // Generate new verification token and update expiry
  const token = generateToken()
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await c.env.DB
    .prepare('UPDATE users SET verification_token = ?, verification_token_expiry = ? WHERE email = ?')
    .bind(token, expiry, email)
    .run()

  // Send verification email
  const verificationUrl = `${c.env.BASE_URL}/verify-email?token=${token}`
  try {
    await sendEmail(
      c,
      email,
      'Resend Verification Email - Speas.org',
      `Hi ${user.name || ''},\n\nClick this link to verify your email: ${verificationUrl}`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #111;">Verify Your Email at <span style="color: #6366f1;">Speas.org</span></h2>
        <p>Hi ${user.name || ''},</p>
        <p>Please verify your email by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p><a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
        <hr />
        <p style="font-size: 12px; color: #999;">If you didn’t request this email, you can safely ignore it.</p>
      </div>
      `
    );
  } catch (err) {
    console.error(err)
    return c.json({ message: 'Failed to send verification email' }, 500)
  }
  return c.json({ message: 'Verification email resent' })
}