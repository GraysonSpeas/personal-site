// src/services/authHelperService.ts
import { getCookie } from 'hono/cookie'
import type { Context } from 'hono'

// Get user email from session cookie
export async function getUserEmail(c: Context<{ Bindings: any }>): Promise<string | null> {
  const session = getCookie(c, 'session')
  if (!session) return null
  try {
    return atob(session)
  } catch {
    return null
  }
}

// Require user to be authenticated
export async function requireUser(c: Context<{ Bindings: any }>): Promise<string> {
  const email = await getUserEmail(c)
  if (!email) {
    c.status(401)
    throw new Error('Unauthorized')
  }
  return email
}

// Get user ID by email
export async function getUserIdByEmail(db: D1Database, email: string): Promise<number | null> {
  const result = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>()
  return result?.id ?? null
}

// Generate reusable HTML email template
export function generateEmailHtml(
  name: string | undefined,
  url: string,
  title: string = 'Action Required',
  buttonText: string = 'Click Here'
) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #111;">${title}</h2>
      <p>Hi ${name || ''},</p>
      <p>Please click the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          ${buttonText}
        </a>
      </p>
      <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
      <p><a href="${url}" style="color: #6366f1;">${url}</a></p>
      <hr />
      <p style="font-size: 12px; color: #999;">If you didn’t request this, you can safely ignore this email.</p>
    </div>
  `;
}