// src/routes/guildRouter.ts
import { Hono } from 'hono'
import * as guildService from '../services/guildService'

const router = new Hono<{ Bindings: any }>()

router.post('/example', guildService.example)
export default router