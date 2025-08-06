/**
 * MCP Authentication Layer
 * Secure authentication and authorization for MCP connections
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

class McpAuthLayer {
  constructor(config = {}) {
    this.config = {
      jwtSecret: config.jwtSecret || process.env.MCP_JWT_SECRET || this.generateSecret(),
      tokenExpiry: config.tokenExpiry || '1h',
      maxRequests: config.maxRequests || 100,
      windowMs: config.windowMs || 15 * 60 * 1000, // 15 minutes
      enableApiKeyAuth: config.enableApiKeyAuth || true,
      enableJwtAuth: config.enableJwtAuth || true,
      validateInputs: config.validateInputs || true,
      ...config
    };
    
    this.apiKeys = new Map();
    this.rateLimiter = this.createRateLimiter();
    this.setupAuth();
  }

  generateSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  createRateLimiter() {
    return rateLimit({
      windowMs: this.config.windowMs,
      max: this.config.maxRequests,
      message: {
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  setupAuth() {
    // Generate default API keys for development
    if (process.env.NODE_ENV !== 'production') {
      this.generateApiKey('development', ['read', 'write', 'execute']);
      this.generateApiKey('testing', ['read']);
    }
  }

  /**
   * Generate API key with permissions
   * @param {string} name - Key identifier
   * @param {string[]} permissions - Array of permissions
   * @returns {string} Generated API key
   */
  generateApiKey(name, permissions = ['read']) {
    const apiKey = 'mcp_' + crypto.randomBytes(32).toString('hex');
    const keyData = {
      name,
      permissions,
      created: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    };
    
    this.apiKeys.set(apiKey, keyData);
    console.log(`Generated API key for ${name}: ${apiKey}`);
    return apiKey;
  }

  /**
   * Validate API key
   * @param {string} apiKey - API key to validate
   * @returns {object|null} Key data or null if invalid
   */
  validateApiKey(apiKey) {
    if (!apiKey || !apiKey.startsWith('mcp_')) {
      return null;
    }

    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) {
      return null;
    }

    // Update usage statistics
    keyData.lastUsed = new Date().toISOString();
    keyData.usageCount++;

    return keyData;
  }

  /**
   * Generate JWT token
   * @param {object} payload - Token payload
   * @returns {string} JWT token
   */
  generateJwtToken(payload) {
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.tokenExpiry,
      issuer: 'mcp-auth-layer',
      audience: 'mcp-client'
    });
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT token to validate
   * @returns {object|null} Decoded payload or null if invalid
   */
  validateJwtToken(token) {
    try {
      return jwt.verify(token, this.config.jwtSecret, {
        issuer: 'mcp-auth-layer',
        audience: 'mcp-client'
      });
    } catch (error) {
      console.error('JWT validation failed:', error.message);
      return null;
    }
  }

  /**
   * Authenticate request
   * @param {object} request - Request object
   * @returns {object} Authentication result
   */
  authenticateRequest(request) {
    const result = {
      authenticated: false,
      user: null,
      permissions: [],
      method: null,
      error: null
    };

    // Extract authentication credentials
    const authHeader = request.headers?.authorization;
    const apiKey = request.headers?.['x-api-key'];

    // Try API Key authentication first
    if (this.config.enableApiKeyAuth && apiKey) {
      const keyData = this.validateApiKey(apiKey);
      if (keyData) {
        result.authenticated = true;
        result.user = keyData.name;
        result.permissions = keyData.permissions;
        result.method = 'api-key';
        return result;
      }
    }

    // Try JWT authentication
    if (this.config.enableJwtAuth && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = this.validateJwtToken(token);
      if (payload) {
        result.authenticated = true;
        result.user = payload.sub;
        result.permissions = payload.permissions || [];
        result.method = 'jwt';
        return result;
      }
    }

    result.error = 'Authentication required';
    return result;
  }

  /**
   * Check if user has required permission
   * @param {string[]} userPermissions - User's permissions
   * @param {string} requiredPermission - Required permission
   * @returns {boolean} Has permission
   */
  hasPermission(userPermissions, requiredPermission) {
    return userPermissions.includes('admin') || 
           userPermissions.includes(requiredPermission);
  }

  /**
   * Validate MCP tool call parameters
   * @param {string} toolName - Name of the tool
   * @param {object} parameters - Tool parameters
   * @returns {object} Validation result
   */
  validateToolCall(toolName, parameters) {
    const result = {
      valid: true,
      errors: [],
      sanitized: { ...parameters }
    };

    if (!this.config.validateInputs) {
      return result;
    }

    // Basic parameter validation
    if (typeof parameters !== 'object' || parameters === null) {
      result.valid = false;
      result.errors.push('Parameters must be an object');
      return result;
    }

    // Tool-specific validation rules
    const validationRules = this.getToolValidationRules(toolName);
    
    for (const [param, rules] of Object.entries(validationRules)) {
      const value = parameters[param];
      
      if (rules.required && (value === undefined || value === null)) {
        result.valid = false;
        result.errors.push(`Parameter '${param}' is required`);
        continue;
      }

      if (value !== undefined) {
        // Type validation
        if (rules.type && typeof value !== rules.type) {
          result.valid = false;
          result.errors.push(`Parameter '${param}' must be of type ${rules.type}`);
        }

        // String length validation
        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          result.valid = false;
          result.errors.push(`Parameter '${param}' exceeds maximum length of ${rules.maxLength}`);
        }

        // Array length validation
        if (rules.maxItems && Array.isArray(value) && value.length > rules.maxItems) {
          result.valid = false;
          result.errors.push(`Parameter '${param}' exceeds maximum items of ${rules.maxItems}`);
        }

        // Sanitize strings
        if (typeof value === 'string' && rules.sanitize !== false) {
          result.sanitized[param] = this.sanitizeString(value);
        }
      }
    }

    return result;
  }

  /**
   * Get validation rules for specific tools
   * @param {string} toolName - Name of the tool
   * @returns {object} Validation rules
   */
  getToolValidationRules(toolName) {
    const commonRules = {
      timeout: { type: 'number', max: 60000 },
      maxResults: { type: 'number', max: 1000 }
    };

    const toolRules = {
      'swarm_init': {
        topology: { type: 'string', required: true, enum: ['mesh', 'star', 'hierarchical', 'ring'] },
        maxAgents: { type: 'number', required: true, min: 1, max: 100 },
        strategy: { type: 'string', enum: ['balanced', 'specialized', 'adaptive'] }
      },
      'agent_spawn': {
        type: { type: 'string', required: true, maxLength: 50 },
        name: { type: 'string', maxLength: 100 },
        capabilities: { type: 'object', maxItems: 20 }
      },
      'task_orchestrate': {
        task: { type: 'string', required: true, maxLength: 1000 },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        strategy: { type: 'string', enum: ['parallel', 'sequential', 'adaptive'] }
      },
      ...commonRules
    };

    return toolRules[toolName] || commonRules;
  }

  /**
   * Sanitize string input
   * @param {string} input - Input string
   * @returns {string} Sanitized string
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/data:/gi, '') // Remove data: URLs
      .trim();
  }

  /**
   * Create secure middleware for Express
   * @returns {function} Express middleware
   */
  createMiddleware() {
    return (req, res, next) => {
      // Apply rate limiting
      this.rateLimiter(req, res, (rateLimitError) => {
        if (rateLimitError) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED'
          });
        }

        // Authenticate request
        const auth = this.authenticateRequest(req);
        if (!auth.authenticated) {
          return res.status(401).json({
            error: auth.error || 'Authentication failed',
            code: 'AUTHENTICATION_FAILED'
          });
        }

        // Attach auth info to request
        req.auth = auth;
        next();
      });
    };
  }

  /**
   * Validate MCP request
   * @param {object} mcpRequest - MCP request object
   * @param {object} auth - Authentication context
   * @returns {object} Validation result
   */
  validateMcpRequest(mcpRequest, auth) {
    const result = {
      valid: true,
      errors: [],
      requiredPermission: null
    };

    if (!mcpRequest.method) {
      result.valid = false;
      result.errors.push('MCP method is required');
      return result;
    }

    // Determine required permission based on method
    if (mcpRequest.method.startsWith('tools/call')) {
      result.requiredPermission = 'execute';
    } else if (mcpRequest.method.startsWith('resources/read')) {
      result.requiredPermission = 'read';
    } else if (mcpRequest.method.startsWith('tools/list')) {
      result.requiredPermission = 'read';
    } else {
      result.requiredPermission = 'admin';
    }

    // Check permissions
    if (!this.hasPermission(auth.permissions, result.requiredPermission)) {
      result.valid = false;
      result.errors.push(`Insufficient permissions. Required: ${result.requiredPermission}`);
    }

    // Validate tool call parameters if applicable
    if (mcpRequest.method === 'tools/call' && mcpRequest.params) {
      const toolValidation = this.validateToolCall(
        mcpRequest.params.name,
        mcpRequest.params.arguments || {}
      );
      
      if (!toolValidation.valid) {
        result.valid = false;
        result.errors.push(...toolValidation.errors);
      }
    }

    return result;
  }

  /**
   * Get authentication statistics
   * @returns {object} Authentication statistics
   */
  getStats() {
    const stats = {
      totalApiKeys: this.apiKeys.size,
      activeApiKeys: 0,
      totalRequests: 0,
      keyUsage: []
    };

    for (const [key, data] of this.apiKeys.entries()) {
      stats.totalRequests += data.usageCount;
      if (data.lastUsed) {
        stats.activeApiKeys++;
      }
      
      stats.keyUsage.push({
        name: data.name,
        usageCount: data.usageCount,
        lastUsed: data.lastUsed,
        created: data.created
      });
    }

    return stats;
  }
}

module.exports = McpAuthLayer;