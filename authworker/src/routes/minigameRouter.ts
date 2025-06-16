import { Hono } from 'hono'
import * as minigameService from '../services/minigameService'
import { requireUser } from '../services/authHelperService'

const router = new Hono<{ Bindings: { DB: D1Database } }>()

router.post('/start', async (c) => {
  try {
    const userId = await requireUser(c)
    console.log('userId type:', typeof userId, 'value:', userId)  // <-- here
    const db = c.env.DB
    if (!db) return c.json({ error: 'Missing database' }, 500)

    const result = await minigameService.startFishing(userId, db)
    return c.json(result)
  } catch (e) {
    console.error('startFishing error:', e)
    if (e instanceof Error) return c.json({ error: e.message }, 400)
    return c.json({ error: 'Unknown error' }, 500)
  }
})

router.post('/catch', async (c) => {
  try {
    const userId = await requireUser(c)
    const db = c.env.DB
    if (!db) return c.json({ error: 'Missing database' }, 500)

    const result = await minigameService.catchFish(userId, db)
    return c.json(result)
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400)
    return c.json({ error: 'Unknown error' }, 500)
  }
})

export default router