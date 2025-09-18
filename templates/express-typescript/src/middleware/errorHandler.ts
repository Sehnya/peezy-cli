import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { config } from '@/config/environment'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

  // Don't leak error details in production
  const response = {
    success: false,
    message: config.isDevelopment ? message : 'Something went wrong',
    ...(config.isDevelopment && { stack: err.stack }),
  }

  res.status(statusCode).json(response)
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}
