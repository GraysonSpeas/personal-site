// src/index.ts
// Overview: main entry point for the auth worker api routing
import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'

import { seedDatabase } from './seeding/seedService'
// Import routers and mount routers
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

// Bindings interface for environment variables and DB
interface Bindings {
  DB: D1Database
  SENDGRID_API_KEY: string
  SENDER_EMAIL: string
  BASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()


// Global CORS middleware & preflight handling
app.use(
  '*',
  cors({
    origin: (origin) => {
      console.log('Origin:', origin);
      const allowed = ['http://localhost:4321', 'https://speas.org']
      return allowed.includes(origin ?? '') ? origin : undefined;
    },
    credentials: true,
  })
)

app.options('*', (c: Context) => c.text('ok'))
// Mount nested routers
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

// Global error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'Internal Server Error' }, 500)
})

// 404 fallback handler
app.notFound((c) => c.json({ message: 'Not found' }, 404))

// Seeding flag
let isSeeded = false;

// Fetch handler with seeding logic
export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    // Check if the seeding has already run
    if (!isSeeded) {
      try {
        console.log('Seeding database...');
        await seedDatabase(env.DB);
        console.log('Database seeded successfully.');
        isSeeded = true; // Set the flag to prevent re-seeding
      } catch (error) {
        console.error('Error during database seeding:', error);
      }
    }

    // Delegate all other requests to Hono app
    return app.fetch(request, env, ctx);
  },
};