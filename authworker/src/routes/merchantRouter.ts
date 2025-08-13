// src/routes/merchantRouter.ts
import { Hono } from 'hono';
import { getMerchantInventory, sellMerchantItem, buyItem } from '../services/merchantService';

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
  return buyItem(c);
});

export default merchantRouter;