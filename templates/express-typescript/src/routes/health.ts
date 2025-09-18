import { Router, Request, Response } from 'express'
import { config } from '@/config/environment'

const router = Router()

interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  environment: string
  version: string
  memory: {
    used: number
    total: number
    percentage: number
  }
}

router.get('/', (_req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage()
  const totalMemory = memoryUsage.heapTotal
  const usedMemory = memoryUsage.heapUsed

  const healthData: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    version: process.env['npm_package_version'] || '1.0.0',
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((usedMemory / totalMemory) * 100),
    },
  }

  res.json(healthData)
})

router.get('/ready', (_req: Request, res: Response) => {
  // Add readiness checks here (database connections, external services, etc.)
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  })
})

router.get('/live', (_req: Request, res: Response) => {
  // Add liveness checks here
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  })
})

export { router as healthRoutes }
