import { Hono } from 'hono'
import * as minigameService from '../services/minigameService'

const router = new Hono<{ Bindings: { DB: D1Database } }>()

router.post('/start', async (c) => {
  try {
    const result = await minigameService.startFishing(c);

    if ('movedToZone' in result) {
      return c.json(result, 403);  // pass status here, not inside object
    }
    return c.json(result);
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: 'Unknown error' }, 500);
  }
});

router.post('/catch', async (c) => {
  try {
    const result = await minigameService.catchFish(c)
    return c.json(result)
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400)
    return c.json({ error: 'Unknown error' }, 500)
  }
})

export default router