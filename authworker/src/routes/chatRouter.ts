// src/routes/chatRouter.ts
import { Hono } from 'hono'
import * as chatService from '../services/chatService'

const router = new Hono<{ Bindings: any }>()

router.post('/example', chatService.example)

export default router