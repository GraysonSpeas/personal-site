// src/routes/authRouter.ts
import { Hono } from 'hono'
import * as authService from '../services/authService'

const auth = new Hono<{ Bindings: any }>()

auth.post('/signup', authService.signup)
auth.get('/verify', authService.verifyEmail)
auth.post('/login', authService.login)
auth.get('/me', authService.getSession)
auth.post('/logout', authService.logout)
auth.post('/request-password-reset', authService.requestPasswordReset)
auth.post('/reset-password', authService.resetPassword)
auth.post('/resend-verification', authService.resendVerification)

export default auth