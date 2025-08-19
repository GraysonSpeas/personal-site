import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import * as planterService from '../services/planterService';

const router = new Hono<{ Bindings: { DB: D1Database } }>();

async function safeCall<T>(c: any, fn: () => Promise<T>) {
  try {
    const result = await fn();
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message || 'Unexpected error' }, 400);
  }
}

// Get all slots for the user
router.get('/slots', (c) =>
  safeCall(c, () => planterService.getActivePlantersService(c))
);

// Get all seed types
router.get('/types', (c) =>
  safeCall(c, () => planterService.getSeedTypesService(c))
);

// Purchase a new slot
router.post('/slots/purchase', (c) =>
  safeCall(c, () => planterService.purchasePlanterSlotService(c))
);

// Upgrade a slot (slotIndex comes from route)
router.post('/slots/:slotIndex/upgrade', (c) =>
  safeCall(c, async () => {
    const slotIndex = Number(c.req.param('slotIndex'));
    return planterService.upgradePlanterSlotService({
      ...c,
      req: { ...c.req, json: async () => ({ slotIndex }) },
    } as any);
  })
);

// Plant a seed in a slot (slotIndex from route, seedTypeId from body)
router.post('/slots/:slotIndex/plant', (c) =>
  safeCall(c, async () => {
    const body = await c.req.json();
    const slotIndex = Number(c.req.param('slotIndex'));
    return planterService.plantSeedService({
      ...c,
      req: { ...c.req, json: async () => ({ ...body, slotIndex }) },
    } as any);
  })
);

// Harvest from a planted seed (plantedId from body)
router.post('/slots/:slotIndex/harvest', (c) =>
  safeCall(c, async () => {
    const body = await c.req.json();
    return planterService.harvestSeedService({
      ...c,
      req: { ...c.req, json: async () => body },
    } as any);
  })
);

export default router;