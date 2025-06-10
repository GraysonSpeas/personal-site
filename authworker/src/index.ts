import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'

// Import route handlers
import auth from './auth'
import fishing from './fishing'

type Bindings = {
  DB: D1Database
  SENDGRID_API_KEY: string
  SENDER_EMAIL: string
  BASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Global CORS middleware
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowed = ['http://localhost:4321', 'https://speas.org']
      return allowed.includes(origin ?? '') ? origin : ''
    },
    credentials: true,
  })
)

// Handle preflight requests globally
app.options('*', (c: Context) => c.text('ok'))

// Mount routes
app.route('/auth', auth)
app.route('/fishing', fishing)

// Fallback
app.notFound((c) => c.json({ message: 'Not found' }, 404))

export default app