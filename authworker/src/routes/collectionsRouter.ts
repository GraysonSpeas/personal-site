// src/routes/collectionsRouter.ts
import { Hono } from 'hono'
import type { Context } from 'hono'
import { getCollectionsService } from '../services/getCollectionsService'

interface Bindings {
  DB: D1Database
}

const collectionsRoute = new Hono<{ Bindings: Bindings }>()

collectionsRoute.get('/', async (c: Context<{ Bindings: Bindings }>) => {
  const data = await getCollectionsService(c)
  if ('error' in data) return c.json({ error: data.error }, 401)
  return c.json(data)
})

export default collectionsRoute