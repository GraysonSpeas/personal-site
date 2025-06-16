// src/services/authHelperService.ts
import { getCookie } from 'hono/cookie'
import type { Context } from 'hono'

export async function getUserEmail(c: Context<{ Bindings: any }>): Promise<string | null> {
  const session = getCookie(c, 'session')
  if (!session) return null
  try {
    return atob(session)
  } catch {
    return null
  }
}

export async function requireUser(c: Context<{ Bindings: any }>): Promise<string> {
  const email = await getUserEmail(c)
  if (!email) {
    c.status(401)
    throw new Error('Unauthorized')
  }
  return email
}

export async function getUserIdByEmail(db: D1Database, email: string): Promise<number | null> {
  const result = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  return result?.id ?? null;
}
