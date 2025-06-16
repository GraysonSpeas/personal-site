// src/routes/inventoryRouter.ts
import { Hono } from 'hono'
import type { Context } from 'hono'
import { getInventoryService } from '../services/getInventoryService'

interface Bindings {
  DB: D1Database
  SENDGRID_API_KEY: string
  SENDER_EMAIL: string
  BASE_URL: string
}

const inventoryRoute = new Hono<{ Bindings: Bindings }>()

inventoryRoute.get('/', async (c) => {
  const data = await getInventoryService(c)
  if ('error' in data) return c.json({ error: data.error }, 401)
  return c.json(data)
})

export default inventoryRoute