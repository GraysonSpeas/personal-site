import { Hono } from 'hono'
import * as gearService from '../services/gearService'

const router = new Hono<{ Bindings: { DB: D1Database } }>()

router.get('/inventory', async (c) => {
  try {
    const result = await gearService.getUserGearService(c)
    return c.json(result)
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400)
    return c.json({ error: 'Unknown error' }, 500)
  }
})

router.post('/equip', async (c) => {
  try {
    const result = await gearService.equipGearService(c)
    return c.json(result)
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400)
    return c.json({ error: 'Unknown error' }, 500)
  }
})

export default router