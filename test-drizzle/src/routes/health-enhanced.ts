import { Router, Request, Response } from 'express'
import { performance } from 'perf_hooks'
import { Pool } from 'pg'
import { createClient } from 'redis'
import { Client } from '@elastic/elasticsearch'

const router = Router()

// Database connections (will be injected)
let dbPool: Pool | null = null
let redisClient: any = null
let elasticsearchClient: Client | null = null

// Initialize database connections
export const initializeHealthChecks = (pool?: Pool, redis?: any, elasticsearch?: Client) => {
  dbPool = pool || null
  redisClient = redis || null
  elasticsearchClient = elasticsearch || null
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  environment: string
  memory: {
    used: number
    total: number
    percentage: number
  }
  responseTime: number
  services: {
    database: 'healthy' | 'unhealthy' | 'not_configured'
    redis: 'healthy' | 'unhealthy' | 'not_configured'
    elasticsearch: 'healthy' | 'unhealthy' | 'not_configured'
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<'healthy' | 'unhealthy' | 'not_configured'> {
  if (!dbPool) return 'not_configured'

  try {
    const client = await dbPool.connect()
    await client.query('SELECT 1')
    client.release()
    return 'healthy'
  } catch (error) {
    return 'unhealthy'
  }
}

/**
 * Check Redis health
 */
async function checkRedisHealth(): Promise<'healthy' | 'unhealthy' | 'not_configured'> {
  if (!redisClient) return 'not_configured'

  try {
    await redisClient.ping()
    return 'healthy'
  } catch (error) {
    return 'unhealthy'
  }
}

/**
 * Check Elasticsearch health
 */
async function checkElasticsearchHealth(): Promise<'healthy' | 'unhealthy' | 'not_configured'> {
  if (!elasticsearchClient) return 'not_configured'

  try {
    await elasticsearchClient.ping()
    return 'healthy'
  } catch (error) {
    return 'unhealthy'
  }
}

/**
 * Enhanced health check endpoint with database monitoring
 * GET /health
 */
router.get('/', async (req: Request, res: Response) => {
  const startTime = performance.now()

  try {
    const memoryUsage = process.memoryUsage()
    const totalMemory = memoryUsage.heapTotal
    const usedMemory = memoryUsage.heapUsed

    // Check all services
    const [databaseStatus, redisStatus, elasticsearchStatus] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkElasticsearchHealth(),
    ])

    // Determine overall status
    const unhealthyServices = [databaseStatus, redisStatus, elasticsearchStatus].filter(
      status => status === 'unhealthy'
    )

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    if (unhealthyServices.length > 0) {
      overallStatus = unhealthyServices.length === 3 ? 'unhealthy' : 'degraded'
    }

    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      responseTime: Math.round(performance.now() - startTime),
      services: {
        database: databaseStatus,
        redis: redisStatus,
        elasticsearch: elasticsearchStatus,
      },
    }

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

    res.status(statusCode).json(healthCheck)
  } catch (error) {
    const healthCheck: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      responseTime: Math.round(performance.now() - startTime),
      services: {
        database: 'unhealthy',
        redis: 'unhealthy',
        elasticsearch: 'unhealthy',
      },
    }

    res.status(503).json(healthCheck)
  }
})

export { router as enhancedHealthRoutes, initializeHealthChecks }
