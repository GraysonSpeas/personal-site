import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import * as planterService from '../services/planterService';

interface Bindings {
  DB: D1Database;
}

const router = new Hono<{ Bindings: Bindings }>();

async function safeCall<T>(c: any, fn: () => Promise<T>) {
  try {
    const result = await fn();
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err?.message || 'Unexpected error' }, 400);
  }
}

// Get all slots for the user
router.get('/slots', (c) => safeCall(c, () => planterService.getActivePlantersService(c)));

// Get all seed types
router.get('/types', (c) => safeCall(c, () => planterService.getSeedTypesService(c)));

// Purchase a new slot
router.post('/slots/purchase', (c) => safeCall(c, () => planterService.purchasePlanterSlotService(c)));

// Upgrade a slot
router.post('/slots/:slotIndex/upgrade', (c) =>
  safeCall(c, async () => {
    const slotIndex = Number(c.req.param('slotIndex'));
    if (isNaN(slotIndex)) throw new Error('Invalid slotIndex');

    // Let the service handle JSON body and slotIndex
    return planterService.upgradePlanterSlotService(c, slotIndex);
  })
);

// Plant a seed in a slot
router.post('/slots/:slotIndex/plant', (c) =>
  safeCall(c, async () => {
    const slotIndex = Number(c.req.param('slotIndex'));
    if (isNaN(slotIndex)) throw new Error('Invalid slotIndex');

    const body = await c.req.json();
    return planterService.plantSeedService(c, slotIndex, body.seedTypeId);
  })
);

// Harvest from a planted seed
router.post('/slots/:slotIndex/harvest', (c) =>
  safeCall(c, async () => {
    const body = await c.req.json();
    return planterService.harvestSeedService(c, body.plantedId);
  })
);

export default router;