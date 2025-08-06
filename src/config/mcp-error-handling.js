/**
 * MCP Error Handling and Retry Mechanisms
 * Robust error handling for MCP connections with intelligent retry logic
 */

const EventEmitter = require('events');

class McpErrorHandler extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxRetries: config.maxRetries || 3,
      baseRetryDelay: config.baseRetryDelay || 1000,
      maxRetryDelay: config.maxRetryDelay || 30000,
      retryMultiplier: config.retryMultiplier || 2,
      enableCircuitBreaker: config.enableCircuitBreaker || true,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout || 60000,
      enableMetrics: config.enableMetrics || true,
      logErrors: config.logErrors !== false,
      ...config
    };

    this.metrics = {
      totalErrors: 0,
      retriedErrors: 0,
      successfulRetries: 0,
      circuitBreakerTrips: 0,
      errorsByType: new Map(),
      lastError: null,
      startTime: Date.now()
    };

    this.circuitBreakers = new Map();
    this.retryQueues = new Map();
    
    this.setupErrorTypes();
  }

  setupErrorTypes() {
    this.errorTypes = {
      CONNECTION_ERROR: {
        code: 'CONNECTION_ERROR',
        retryable: true,
        severity: 'high',
        defaultMessage: 'Failed to connect to MCP server'
      },
      TIMEOUT_ERROR: {
        code: 'TIMEOUT_ERROR',
        retryable: true,
        severity: 'medium',
        defaultMessage: 'Request timed out'
      },
      AUTHENTICATION_ERROR: {
        code: 'AUTHENTICATION_ERROR',
        retryable: false,
        severity: 'high',
        defaultMessage: 'Authentication failed'
      },
      VALIDATION_ERROR: {
        code: 'VALIDATION_ERROR',
        retryable: false,
        severity: 'low',
        defaultMessage: 'Request validation failed'
      },
      RATE_LIMIT_ERROR: {
        code: 'RATE_LIMIT_ERROR',
        retryable: true,
        severity: 'medium',
        defaultMessage: 'Rate limit exceeded'
      },
      SERVER_ERROR: {
        code: 'SERVER_ERROR',
        retryable: true,
        severity: 'high',
        defaultMessage: 'MCP server error'
      },
      UNKNOWN_ERROR: {
        code: 'UNKNOWN_ERROR',
        retryable: true,
        severity: 'medium',
        defaultMessage: 'Unknown error occurred'
      }
    };
  }

  /**
   * Classify error type based on error object
   * @param {Error} error - Error object
   * @returns {object} Error classification
   */
  classifyError(error) {
    if (!error) {
      return this.errorTypes.UNKNOWN_ERROR;
    }

    // Check for specific error patterns
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return this.errorTypes.CONNECTION_ERROR;
    }

    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return this.errorTypes.TIMEOUT_ERROR;
    }

    if (error.message?.includes('authentication') || error.status === 401) {
      return this.errorTypes.AUTHENTICATION_ERROR;
    }

    if (error.message?.includes('validation') || error.status === 400) {
      return this.errorTypes.VALIDATION_ERROR;
    }

    if (error.status === 429 || error.message?.includes('rate limit')) {
      return this.errorTypes.RATE_LIMIT_ERROR;
    }

    if (error.status >= 500) {
      return this.errorTypes.SERVER_ERROR;
    }

    return this.errorTypes.UNKNOWN_ERROR;
  }

  /**
   * Create enhanced error object
   * @param {Error} originalError - Original error
   * @param {object} context - Error context
   * @returns {Error} Enhanced error
   */
  createEnhancedError(originalError, context = {}) {
    const errorType = this.classifyError(originalError);
    const enhancedError = new Error(originalError.message || errorType.defaultMessage);
    
    enhancedError.code = errorType.code;
    enhancedError.retryable = errorType.retryable;
    enhancedError.severity = errorType.severity;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.context = context;
    enhancedError.originalError = originalError;
    
    return enhancedError;
  }

  /**
   * Handle error with appropriate strategy
   * @param {Error} error - Error to handle
   * @param {object} context - Error context
   * @returns {Promise<object>} Handling result
   */
  async handleError(error, context = {}) {
    const enhancedError = this.createEnhancedError(error, context);
    
    // Update metrics
    this.updateMetrics(enhancedError);
    
    // Log error if enabled
    if (this.config.logErrors) {
      this.logError(enhancedError, context);
    }

    // Emit error event
    this.emit('error', enhancedError, context);

    // Check circuit breaker
    if (this.config.enableCircuitBreaker) {
      const breakerStatus = this.checkCircuitBreaker(context.serverId || 'default');
      if (breakerStatus.isOpen) {
        return {
          success: false,
          error: enhancedError,
          retryable: false,
          reason: 'Circuit breaker is open',
          nextRetryAt: breakerStatus.nextRetryAt
        };
      }
    }

    // Determine if we should retry
    const retryDecision = this.shouldRetry(enhancedError, context);
    
    return {
      success: false,
      error: enhancedError,
      retryable: retryDecision.shouldRetry,
      retryAfter: retryDecision.retryAfter,
      reason: retryDecision.reason
    };
  }

  /**
   * Determine if error should be retried
   * @param {Error} error - Enhanced error object
   * @param {object} context - Error context
   * @returns {object} Retry decision
   */
  shouldRetry(error, context = {}) {
    const result = {
      shouldRetry: false,
      retryAfter: 0,
      reason: 'Not retryable'
    };

    // Check if error type is retryable
    if (!error.retryable) {
      result.reason = `Error type ${error.code} is not retryable`;
      return result;
    }

    // Check retry count
    const currentRetries = context.retryCount || 0;
    if (currentRetries >= this.config.maxRetries) {
      result.reason = `Maximum retries (${this.config.maxRetries}) exceeded`;
      return result;
    }

    // Calculate retry delay
    const retryDelay = this.calculateRetryDelay(currentRetries, error.code);
    
    result.shouldRetry = true;
    result.retryAfter = retryDelay;
    result.reason = `Retry ${currentRetries + 1} of ${this.config.maxRetries}`;
    
    return result;
  }

  /**
   * Calculate retry delay using exponential backoff with jitter
   * @param {number} retryCount - Current retry count
   * @param {string} errorCode - Error code
   * @returns {number} Delay in milliseconds
   */
  calculateRetryDelay(retryCount, errorCode) {
    let delay = this.config.baseRetryDelay * Math.pow(this.config.retryMultiplier, retryCount);
    
    // Apply error-specific adjustments
    if (errorCode === 'RATE_LIMIT_ERROR') {
      delay *= 2; // Longer delays for rate limits
    } else if (errorCode === 'CONNECTION_ERROR') {
      delay *= 1.5; // Slightly longer for connection issues
    }

    // Apply jitter (±20%)
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    delay += jitter;

    // Enforce maximum delay
    return Math.min(delay, this.config.maxRetryDelay);
  }

  /**
   * Execute operation with retry logic
   * @param {function} operation - Operation to execute
   * @param {object} context - Execution context
   * @returns {Promise<any>} Operation result
   */
  async executeWithRetry(operation, context = {}) {
    let lastError = null;
    let retryCount = 0;

    while (retryCount <= this.config.maxRetries) {
      try {
        const result = await operation(context);
        
        // Reset circuit breaker on success
        if (this.config.enableCircuitBreaker && retryCount > 0) {
          this.resetCircuitBreaker(context.serverId || 'default');
        }
        
        // Update success metrics
        if (retryCount > 0) {
          this.metrics.successfulRetries++;
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        const handlingResult = await this.handleError(error, { 
          ...context, 
          retryCount 
        });

        if (!handlingResult.retryable || retryCount >= this.config.maxRetries) {
          throw handlingResult.error;
        }

        // Wait before retry
        if (handlingResult.retryAfter > 0) {
          await this.sleep(handlingResult.retryAfter);
        }

        retryCount++;
        this.metrics.retriedErrors++;
      }
    }

    throw lastError;
  }

  /**
   * Circuit breaker implementation
   * @param {string} serverId - Server identifier
   * @returns {object} Circuit breaker status
   */
  checkCircuitBreaker(serverId) {
    if (!this.config.enableCircuitBreaker) {
      return { isOpen: false };
    }

    const breaker = this.circuitBreakers.get(serverId) || {
      failures: 0,
      lastFailure: null,
      state: 'closed', // closed, open, half-open
      nextRetryAt: null
    };

    const now = Date.now();

    // Check if circuit breaker should transition states
    if (breaker.state === 'open') {
      if (now >= breaker.nextRetryAt) {
        breaker.state = 'half-open';
        this.circuitBreakers.set(serverId, breaker);
      } else {
        return {
          isOpen: true,
          nextRetryAt: breaker.nextRetryAt,
          failures: breaker.failures
        };
      }
    }

    return {
      isOpen: false,
      state: breaker.state,
      failures: breaker.failures
    };
  }

  /**
   * Trip circuit breaker
   * @param {string} serverId - Server identifier
   */
  tripCircuitBreaker(serverId) {
    if (!this.config.enableCircuitBreaker) return;

    const breaker = this.circuitBreakers.get(serverId) || {
      failures: 0,
      lastFailure: null,
      state: 'closed',
      nextRetryAt: null
    };

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.state = 'open';
      breaker.nextRetryAt = Date.now() + this.config.circuitBreakerTimeout;
      this.metrics.circuitBreakerTrips++;
      
      this.emit('circuitBreakerTripped', { serverId, breaker });
    }

    this.circuitBreakers.set(serverId, breaker);
  }

  /**
   * Reset circuit breaker
   * @param {string} serverId - Server identifier
   */
  resetCircuitBreaker(serverId) {
    if (!this.config.enableCircuitBreaker) return;

    const breaker = this.circuitBreakers.get(serverId);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
      breaker.nextRetryAt = null;
      this.circuitBreakers.set(serverId, breaker);
      
      this.emit('circuitBreakerReset', { serverId });
    }
  }

  /**
   * Update error metrics
   * @param {Error} error - Error object
   */
  updateMetrics(error) {
    if (!this.config.enableMetrics) return;

    this.metrics.totalErrors++;
    this.metrics.lastError = {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp
    };

    // Update error type counters
    const typeCount = this.metrics.errorsByType.get(error.code) || 0;
    this.metrics.errorsByType.set(error.code, typeCount + 1);

    // Trip circuit breaker if needed
    if (error.severity === 'high') {
      this.tripCircuitBreaker(error.context?.serverId || 'default');
    }
  }

  /**
   * Log error details
   * @param {Error} error - Error to log
   * @param {object} context - Error context
   */
  logError(error, context) {
    const logLevel = this.getLogLevel(error.severity);
    const logData = {
      error: {
        code: error.code,
        message: error.message,
        severity: error.severity,
        retryable: error.retryable,
        timestamp: error.timestamp
      },
      context,
      stack: error.originalError?.stack
    };

    console[logLevel](`[MCP Error Handler] ${error.code}:`, JSON.stringify(logData, null, 2));
  }

  /**
   * Get appropriate log level for error severity
   * @param {string} severity - Error severity
   * @returns {string} Log level
   */
  getLogLevel(severity) {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warn';
      case 'low': return 'info';
      default: return 'log';
    }
  }

  /**
   * Sleep for specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error handling statistics
   * @returns {object} Error statistics
   */
  getStats() {
    const uptime = Date.now() - this.metrics.startTime;
    const errorRate = this.metrics.totalErrors / (uptime / 1000); // errors per second

    return {
      ...this.metrics,
      uptime,
      errorRate: Number(errorRate.toFixed(4)),
      successRate: this.metrics.totalErrors > 0 
        ? Number(((this.metrics.successfulRetries / this.metrics.totalErrors) * 100).toFixed(2))
        : 100,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([id, breaker]) => ({
        serverId: id,
        state: breaker.state,
        failures: breaker.failures,
        lastFailure: breaker.lastFailure,
        nextRetryAt: breaker.nextRetryAt
      })),
      errorsByType: Object.fromEntries(this.metrics.errorsByType)
    };
  }

  /**
   * Reset all metrics
   */
  resetStats() {
    this.metrics = {
      totalErrors: 0,
      retriedErrors: 0,
      successfulRetries: 0,
      circuitBreakerTrips: 0,
      errorsByType: new Map(),
      lastError: null,
      startTime: Date.now()
    };

    this.circuitBreakers.clear();
    this.emit('statsReset');
  }

  /**
   * Create error handling middleware for specific MCP operations
   * @param {string} operationType - Type of operation
   * @returns {function} Middleware function
   */
  createMiddleware(operationType = 'general') {
    return async (operation, context = {}) => {
      const enhancedContext = {
        ...context,
        operationType,
        timestamp: Date.now()
      };

      return this.executeWithRetry(operation, enhancedContext);
    };
  }
}

module.exports = McpErrorHandler;