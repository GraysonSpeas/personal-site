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

router.get('/owned', async (c) => {
  try {
    const session = c.req.header('cookie')?.match(/session=([^;]+)/)?.[1];
    if (!session) return c.json({ error: 'Unauthorized' }, 401);

    let email: string;
    try {
      email = atob(session);
    } catch {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const db = c.env.DB as D1Database;
    const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
    if (!user) return c.json({ error: 'User not found' }, 404);

    const consumables = await db.prepare(`
      SELECT c.type_id, ct.name, c.quantity
      FROM consumables c
      JOIN consumableTypes ct ON c.type_id = ct.id
      WHERE c.user_id = ?
    `).bind(user.id).all();

    return c.json({ consumables: consumables.results });
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

export default router;