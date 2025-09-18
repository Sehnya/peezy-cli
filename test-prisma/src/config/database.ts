import { Pool } from 'pg'
import { createClient } from 'redis'
import { Client } from '@elastic/elasticsearch'
import { logger } from '../utils/logger.js'

// PostgreSQL connection
export const createDatabasePool = (): Pool => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  pool.on('connect', () => {
    logger.info('Connected to PostgreSQL database')
  })

  pool.on('error', err => {
    logger.error('PostgreSQL connection error:', err)
  })

  return pool
}

// Redis connection
export const createRedisClient = () => {
  if (!process.env.REDIS_URL) {
    logger.warn('Redis URL not configured, skipping Redis connection')
    return null
  }

  const client = createClient({
    url: process.env.REDIS_URL,
  })

  client.on('connect', () => {
    logger.info('Connected to Redis')
  })

  client.on('error', err => {
    logger.error('Redis connection error:', err)
  })

  return client
}

// Elasticsearch connection
export const createElasticsearchClient = () => {
  if (!process.env.ELASTICSEARCH_URL) {
    logger.warn('Elasticsearch URL not configured, skipping Elasticsearch connection')
    return null
  }

  const client = new Client({
    node: process.env.ELASTICSEARCH_URL,
  })

  return client
}

// Database health check
export const checkDatabaseHealth = async (pool: Pool): Promise<boolean> => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (error) {
    logger.error('Database health check failed:', error)
    return false
  }
}

// Redis health check
export const checkRedisHealth = async (client: any): Promise<boolean> => {
  if (!client) return true // Skip if Redis not configured

  try {
    await client.ping()
    return true
  } catch (error) {
    logger.error('Redis health check failed:', error)
    return false
  }
}

// Elasticsearch health check
export const checkElasticsearchHealth = async (client: any): Promise<boolean> => {
  if (!client) return true // Skip if Elasticsearch not configured

  try {
    await client.ping()
    return true
  } catch (error) {
    logger.error('Elasticsearch health check failed:', error)
    return false
  }
}
