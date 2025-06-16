// src/routes/zoneRouter.ts
import { Hono } from 'hono';
import { updateUserZone } from '../services/zoneSelectionService';
import { requireUser } from '../services/authHelperService';

interface Bindings {
  DB: D1Database;
}

const zoneRouter = new Hono<{ Bindings: Bindings }>();

zoneRouter.post('/select', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: 'Missing database' }, 500);

  const userEmail = await requireUser(c); // Assumes requireUser returns the email directly
  const { zoneId } = await c.req.json();

  if (!zoneId || typeof zoneId !== 'number') {
    return c.json({ error: 'Invalid or missing zoneId' }, 400);
  }

  try {
    await updateUserZone(db, userEmail, zoneId); // Use userEmail directly
    return c.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Unknown error' }, 500);
  }
});

export default zoneRouter;