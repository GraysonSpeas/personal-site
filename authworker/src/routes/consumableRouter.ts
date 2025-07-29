import { Hono } from 'hono';
import * as consumableService from '../services/consumableService';

const router = new Hono<{ Bindings: { DB: D1Database } }>();

router.get('/active', async (c) => {
  try {
    const result = await consumableService.getActiveConsumablesService(c);
    return c.json(result);
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: 'Unknown error' }, 500);
  }
});

router.post('/use', async (c) => {
  try {
    const result = await consumableService.useConsumableService(c);
    return c.json(result);
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: 'Unknown error' }, 500);
  }
});

router.post('/cancel', async (c) => {
  try {
    const result = await consumableService.cancelConsumableService(c);
    return c.json(result);
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: 'Unknown error' }, 500);
  }
});

router.get('/owned', async (c) => {
  try {
    const result = await consumableService.getOwnedConsumablesService(c);
    return c.json(result);
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: 'Unknown error' }, 500);
  }
});

export default router;