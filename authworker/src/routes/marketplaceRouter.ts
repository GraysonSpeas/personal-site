// src/routes/marketplaceRouter.ts
import { Hono } from 'hono'
import * as marketplaceService from '../services/marketplaceService'

const router = new Hono<{ Bindings: any }>()

router.post('/list', marketplaceService.example)

export default router