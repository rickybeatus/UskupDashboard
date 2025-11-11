/**
 * Standardized Error Handling for Dashboard Uskup Surabaya
 * Provides consistent error formats and logging across the application
 */

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  requestId?: string
  stack?: string
}

export interface ErrorResponse {
  success: false
  error: AppError
  data?: null
}

// Error types for better categorization
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHZ_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_API: 'EXTERNAL_API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
  NETWORK: 'NETWORK_ERROR'
} as const

// HTTP status codes
export const HTTPStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

/**
 * Generate unique request ID for tracing
 */
let requestCounter = 0
export function generateRequestId(): string {
  requestCounter++
  return `req_${Date.now()}_${requestCounter}`
}

/**
 * Create standardized error object
 */
export function createError(
  type: keyof typeof ErrorTypes,
  message: string,
  details?: any,
  requestId?: string
): AppError {
  return {
    code: ErrorTypes[type],
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
    stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
  }
}

/**
 * Create error response
 */
export function createErrorResponse(
  type: keyof typeof ErrorTypes,
  message: string,
  details?: any,
  statusCode?: number,
  requestId?: string
): Response {
  const error = createError(type, message, details, requestId)
  const status = statusCode || getStatusCodeForErrorType(type)
  
  return new Response(
    JSON.stringify({
      success: false,
      error,
      data: null
    } as ErrorResponse),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': error.requestId
      }
    }
  )
}

/**
 * Get appropriate HTTP status code for error type
 */
function getStatusCodeForErrorType(type: keyof typeof ErrorTypes): number {
  switch (type) {
    case 'VALIDATION':
      return HTTPStatus.BAD_REQUEST
    case 'AUTHENTICATION':
      return HTTPStatus.UNAUTHORIZED
    case 'AUTHORIZATION':
      return HTTPStatus.FORBIDDEN
    case 'NOT_FOUND':
      return HTTPStatus.NOT_FOUND
    case 'CONFLICT':
      return HTTPStatus.CONFLICT
    case 'DATABASE':
    case 'INTERNAL':
      return HTTPStatus.INTERNAL_SERVER_ERROR
    case 'EXTERNAL_API':
    case 'NETWORK':
      return HTTPStatus.SERVICE_UNAVAILABLE
    case 'RATE_LIMIT':
      return 429 // Custom rate limit status
    default:
      return HTTPStatus.INTERNAL_SERVER_ERROR
  }
}

/**
 * Handle and log errors consistently
 */
export function handleError(
  error: any,
  context: string,
  requestId?: string
): AppError {
  let errorType: keyof typeof ErrorTypes = 'INTERNAL'
  let errorMessage = 'An unexpected error occurred'
  let errorDetails = error

  // Determine error type based on error object
  if (error?.name === 'ValidationError' || error?.code === 'VALIDATION') {
    errorType = 'VALIDATION'
    errorMessage = error.message || 'Validation failed'
  } else if (error?.name === 'UnauthorizedError' || error?.status === 401) {
    errorType = 'AUTHENTICATION'
    errorMessage = 'Authentication required'
  } else if (error?.name === 'ForbiddenError' || error?.status === 403) {
    errorType = 'AUTHORIZATION'
    errorMessage = 'Access forbidden'
  } else if (error?.code === 'P2002' || error?.code === '23505') {
    errorType = 'CONFLICT'
    errorMessage = 'Resource already exists'
  } else if (error?.code?.startsWith('P2') || error?.code === '23503') {
    errorType = 'DATABASE'
    errorMessage = 'Database operation failed'
  } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    errorType = 'NETWORK'
    errorMessage = 'Network error occurred'
  } else if (error?.status === 429) {
    errorType = 'RATE_LIMIT'
    errorMessage = 'Too many requests'
  }

  // Create standardized error
  const appError = createError(errorType, errorMessage, errorDetails, requestId)

  // Log error with context
  console.error(`[${context}]`, {
    error: appError.code,
    message: appError.message,
    requestId: appError.requestId,
    details: errorDetails,
    timestamp: appError.timestamp
  })

  return appError
}

/**
 * Async error handler for API routes
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  context: string
) {
  return async (...args: T): Promise<Response> => {
    const requestId = generateRequestId()
    
    try {
      return await handler(...args)
    } catch (error) {
      const appError = handleError(error, context, requestId)
      return createErrorResponse(
        appError.code as keyof typeof ErrorTypes,
        appError.message,
        appError.details,
        undefined,
        requestId
      )
    }
  }
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(error: any, context: string): AppError {
  let errorType: keyof typeof ErrorTypes = 'DATABASE'
  let errorMessage = 'Database operation failed'

  if (error.code === 'P2002') {
    errorType = 'CONFLICT'
    errorMessage = `Duplicate entry: ${error.meta?.target?.join(', ') || 'field'} already exists`
  } else if (error.code === 'P2025') {
    errorType = 'NOT_FOUND'
    errorMessage = 'Record not found'
  } else if (error.code === 'P2003') {
    errorType = 'VALIDATION'
    errorMessage = 'Foreign key constraint violation'
  } else if (error.message?.includes('Unique constraint')) {
    errorType = 'CONFLICT'
    errorMessage = 'Record already exists'
  }

  return handleError(error, context)
}

/**
 * Validation error helper
 */
export function createValidationError(
  field: string,
  message: string,
  value?: any
): AppError {
  return createError('VALIDATION', `Validation failed for field '${field}': ${message}`, {
    field,
    value,
    expected: 'Valid input'
  })
}

/**
 * Authentication error helper
 */
export function createAuthError(message: string = 'Authentication required'): AppError {
  return createError('AUTHENTICATION', message)
}

/**
 * Authorization error helper
 */
export function createAuthzError(message: string = 'Access forbidden'): AppError {
  return createError('AUTHORIZATION', message)
}

/**
 * Not found error helper
 */
export function createNotFoundError(resource: string, id?: string): AppError {
  const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`
  return createError('NOT_FOUND', message, { resource, id })
}

/**
 * Success response helper
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message: message || 'Operation completed successfully',
      requestId: requestId || generateRequestId(),
      timestamp: new Date().toISOString()
    }),
    {
      status: HTTPStatus.OK,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId || generateRequestId()
      }
    }
  )
}

/**
 * Created response helper
 */
export function createCreatedResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message: message || 'Resource created successfully',
      requestId: requestId || generateRequestId(),
      timestamp: new Date().toISOString()
    }),
    {
      status: HTTPStatus.CREATED,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId || generateRequestId()
      }
    }
  )
}