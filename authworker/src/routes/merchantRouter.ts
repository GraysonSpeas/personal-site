// src/routes/merchantRouter.ts
import { Hono } from 'hono';
import { getMerchantInventory, sellMerchantItem, buyBrokenBait } from '../services/merchantService';

interface Bindings {
  DB: D1Database;
}

const merchantRouter = new Hono<{ Bindings: Bindings }>();

merchantRouter.get('/inventory', async (c) => {
  return getMerchantInventory(c);
});

merchantRouter.post('/sell', async (c) => {
  return sellMerchantItem(c);
});

merchantRouter.post('/buy', async (c) => {
  return buyBrokenBait(c);
});

export default merchantRouter;