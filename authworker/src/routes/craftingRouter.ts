// src/routes/craftingRouter.ts
import { Hono } from 'hono'
import * as craftingService from '../services/craftingService'

const router = new Hono<{ Bindings: any }>()

router.post('/example', craftingService.example)

export default router