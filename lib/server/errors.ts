/**
 * Standard error handling for API routes
 * Prevents leaking sensitive information to clients
 */

import type { NextApiResponse } from 'next'
import { ZodError } from 'zod'
import { formatValidationErrors } from './validation'

interface AppError extends Error {
  statusCode?: number
}

/**
 * Handle errors in API routes consistently
 * Never leaks stack traces or sensitive data to production clients
 */
export function handleApiError(error: unknown, res: NextApiResponse) {
  console.error('API Error:', error)

  // Validation errors (400)
  if (error instanceof ZodError) {
    return res.status(400).json(formatValidationErrors(error))
  }

  // Application errors with status codes
  if (error instanceof Error && 'statusCode' in error) {
    const appError = error as AppError
    return res.status(appError.statusCode || 500).json({
      error: appError.message
    })
  }

  // Generic errors
  if (error instanceof Error) {
    // In production, don't leak error details
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        error: 'An unexpected error occurred'
      })
    }
    
    // In development, show the error
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }

  // Unknown error type
  return res.status(500).json({
    error: 'An unexpected error occurred'
  })
}

/**
 * Create standardized API error
 */
export function createError(message: string, statusCode = 500): AppError {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  return error
}

/**
 * Standard success response
 */
export function successResponse(data: unknown, res: NextApiResponse, status = 200) {
  return res.status(status).json(data)
}

