// src/routes/collectionsRouter.ts
import { Hono } from 'hono'
import type { Context } from 'hono'
import { getCollectionsService } from '../services/getCollectionsService'
import { claimRewardService } from '../services/getCollectionsService'

interface Bindings {
  DB: D1Database
}

const collectionsRoute = new Hono<{ Bindings: Bindings }>()

collectionsRoute.get('/', async (c: Context<{ Bindings: Bindings }>) => {
  const data = await getCollectionsService(c)
  if ('error' in data) return c.json({ error: data.error }, 401)
  return c.json(data)
})

collectionsRoute.post('/claim', async (c: Context<{ Bindings: Bindings }>) => {
  const body = await c.req.json()
  const result = await claimRewardService(c, body)
  if ('error' in result) return c.json(result, 400)
  return c.json(result)
})

export default collectionsRoute