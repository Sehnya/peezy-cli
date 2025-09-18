import { Router } from 'express'
import { userRoutes } from './users'

const router = Router()

// API routes
router.use('/users', userRoutes)

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to {{name}} API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      users: '/api/v1/users',
    },
  })
})

export { router as apiRoutes }
