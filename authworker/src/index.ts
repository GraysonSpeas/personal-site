// src/index.ts
import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'

// Import routers
import authRouter from './routes/authRouter'
import inventoryRouter from './routes/inventoryRouter'
import minigameRouter from './routes/minigameRouter'
import zoneSelectionRouter from './routes/zoneSelectionRouter'
import gearRouter from './routes/gearRouter'
import timeContentRouter from './routes/timeContentRouter'
import merchantRouter from './routes/merchantRouter'
import craftingRouter from './routes/craftingRouter'
import consumableRouter from './routes/consumableRouter'
import collectionsRouter from './routes/collectionsRouter'
import planterRouter from './routes/planterRouter'

// Bindings interface
interface Bindings {
  DB: D1Database
  SENDGRID_API_KEY: string
  SENDER_EMAIL: string
  BASE_URL: string
  SOME_SECRET_KEY: string // for seed endpoint
}

const app = new Hono<{ Bindings: Bindings }>()

// Global CORS middleware
app.use('*', cors({
  origin: (origin) => {
    const allowed = ['http://localhost:4321', 'https://speas.org']
    return allowed.includes(origin ?? '') ? origin : undefined
  },
  credentials: true,
}))
app.options('*', (c) => c.text('ok'))

// Mount routers
app.route('/auth', authRouter)
app.route('/inventory', inventoryRouter)
app.route('/minigame', minigameRouter)
app.route('/zone', zoneSelectionRouter)
app.route('/gear', gearRouter)
app.route('/timecontent', timeContentRouter)
app.route('/merchant', merchantRouter)
app.route('/crafting', craftingRouter)
app.route('/consumables', consumableRouter)
app.route('/collections', collectionsRouter)
app.route('/planters', planterRouter)

// Dedicated DB seeding endpoint
app.get('/seed', async (c: Context) => {
  // Optional security key
  const secret = c.req.query('key')
  if (secret !== c.env.SOME_SECRET_KEY) return c.json({ message: 'Forbidden' }, 403)

  try {
    const { seedDatabase } = await import('./seeding/seedService')
    await seedDatabase(c.env.DB)
    return c.json({ message: 'DB seeded successfully' })
  } catch (err) {
    console.error('Seeding error:', err)
    return c.json({ message: 'Seeding failed', error: String(err) }, 500)
  }
})

// Global error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'Internal Server Error' }, 500)
})

// 404 fallback
app.notFound((c) => c.json({ message: 'Not found' }, 404))

// Export Worker fetch
export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx)
  },
}