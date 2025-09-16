// Comprehensive API documentation generator with OpenAPI/Swagger support

import { createAPIDocumentation } from './api-optimizer'

export interface APISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
    contact?: {
      name: string
      email: string
      url: string
    }
    license?: {
      name: string
      url: string
    }
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, any>
  components: {
    schemas: Record<string, any>
    securitySchemes: Record<string, any>
    responses: Record<string, any>
    parameters: Record<string, any>
  }
  security: Array<Record<string, string[]>>
  tags: Array<{
    name: string
    description: string
  }>
}

export interface EndpointDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  summary: string
  description: string
  tags: string[]
  parameters?: Array<{
    name: string
    in: 'query' | 'path' | 'header' | 'cookie'
    required: boolean
    schema: any
    description?: string
    example?: any
  }>
  requestBody?: {
    required: boolean
    content: Record<string, {
      schema: any
      example?: any
    }>
  }
  responses: Record<number, {
    description: string
    content?: Record<string, {
      schema: any
      example?: any
    }>
  }>
  security?: Array<Record<string, string[]>>
  deprecated?: boolean
  operationId?: string
}

class APIDocumentationGenerator {
  private static instance: APIDocumentationGenerator
  private endpoints: EndpointDefinition[] = []
  private schemas: Record<string, any> = {}
  private securitySchemes: Record<string, any> = {}

  static getInstance(): APIDocumentationGenerator {
    if (!APIDocumentationGenerator.instance) {
      APIDocumentationGenerator.instance = new APIDocumentationGenerator()
    }
    return APIDocumentationGenerator.instance
  }

  addEndpoint(endpoint: EndpointDefinition): void {
    this.endpoints.push(endpoint)
  }

  addSchema(name: string, schema: any): void {
    this.schemas[name] = schema
  }

  addSecurityScheme(name: string, scheme: any): void {
    this.securitySchemes[name] = scheme
  }

  generateOpenAPISpec(): APISpec {
    const spec: APISpec = {
      openapi: '3.0.0',
      info: {
        title: 'iSpaan API',
        version: '1.0.0',
        description: 'Comprehensive API for the iSpaan learning management platform',
        contact: {
          name: 'iSpaan Support',
          email: 'support@ispaan.com',
          url: 'https://ispaan.com/support'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'https://api.ispaan.com',
          description: 'Production server'
        },
        {
          url: 'https://staging-api.ispaan.com',
          description: 'Staging server'
        },
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      paths: this.generatePaths(),
      components: {
        schemas: this.schemas,
        securitySchemes: this.securitySchemes,
        responses: this.generateCommonResponses(),
        parameters: this.generateCommonParameters()
      },
      security: [
        { bearerAuth: [] },
        { apiKey: [] }
      ],
      tags: this.generateTags()
    }

    return spec
  }

  private generatePaths(): Record<string, any> {
    const paths: Record<string, any> = {}

    for (const endpoint of this.endpoints) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {}
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        operationId: endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        parameters: endpoint.parameters?.map(param => ({
          name: param.name,
          in: param.in,
          required: param.required,
          schema: param.schema,
          description: param.description,
          example: param.example
        })),
        requestBody: endpoint.requestBody ? {
          required: endpoint.requestBody.required,
          content: endpoint.requestBody.content
        } : undefined,
        responses: endpoint.responses,
        security: endpoint.security,
        deprecated: endpoint.deprecated
      }
    }

    return paths
  }

  private generateCommonResponses(): Record<string, any> {
    return {
      Success: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
                message: { type: 'string' },
                timestamp: { type: 'number', example: 1640995200000 }
              }
            }
          }
        }
      },
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Validation failed' },
                details: { type: 'array', items: { type: 'string' } },
                timestamp: { type: 'number', example: 1640995200000 }
              }
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Authentication required' },
                timestamp: { type: 'number', example: 1640995200000 }
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Insufficient permissions' },
                timestamp: { type: 'number', example: 1640995200000 }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Resource not found' },
                timestamp: { type: 'number', example: 1640995200000 }
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Internal server error' },
                timestamp: { type: 'number', example: 1640995200000 }
              }
            }
          }
        }
      }
    }
  }

  private generateCommonParameters(): Record<string, any> {
    return {
      Page: {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number for pagination'
      },
      Limit: {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        description: 'Number of items per page'
      },
      Sort: {
        name: 'sort',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Sort field and order (e.g., "createdAt:desc")'
      },
      Search: {
        name: 'search',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Search query'
      },
      Filter: {
        name: 'filter',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Filter criteria (JSON string)'
      }
    }
  }

  private generateTags(): Array<{ name: string; description: string }> {
    return [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Applications', description: 'Application management' },
      { name: 'Learners', description: 'Learner-specific operations' },
      { name: 'Placements', description: 'Placement management' },
      { name: 'Companies', description: 'Company management' },
      { name: 'Documents', description: 'Document management' },
      { name: 'Notifications', description: 'Notification system' },
      { name: 'Analytics', description: 'Analytics and reporting' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'System', description: 'System health and configuration' }
    ]
  }
}

// Predefined API endpoints
export class APIDefinitions {
  private static generator = APIDocumentationGenerator.getInstance()

  static initialize(): void {
    this.setupSchemas()
    this.setupSecuritySchemes()
    this.setupEndpoints()
  }

  private static setupSchemas(): void {
    // User schemas
    this.generator.addSchema('User', {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        displayName: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string', enum: ['applicant', 'learner', 'admin', 'super-admin'] },
        status: { type: 'string', enum: ['pending', 'active', 'inactive', 'suspended'] },
        phone: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'email', 'displayName', 'firstName', 'lastName', 'role', 'status', 'isActive']
    })

    this.generator.addSchema('UserProfile', {
      type: 'object',
      properties: {
        bio: { type: 'string' },
        avatar: { type: 'string', format: 'uri' },
        department: { type: 'string' },
        position: { type: 'string' },
        location: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        experience: { type: 'string' },
        education: { type: 'array', items: { $ref: '#/components/schemas/Education' } }
      }
    })

    this.generator.addSchema('Education', {
      type: 'object',
      properties: {
        institution: { type: 'string' },
        degree: { type: 'string' },
        field: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        gpa: { type: 'number', minimum: 0, maximum: 4 }
      }
    })

    // Application schemas
    this.generator.addSchema('Application', {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        program: { type: 'string' },
        motivation: { type: 'string' },
        experience: { type: 'string' },
        availability: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        emergencyContact: { $ref: '#/components/schemas/EmergencyContact' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'userId', 'program', 'motivation', 'experience', 'availability', 'status', 'priority']
    })

    this.generator.addSchema('EmergencyContact', {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        relationship: { type: 'string' },
        email: { type: 'string', format: 'email' }
      },
      required: ['name', 'phone', 'relationship']
    })

    // Common schemas
    this.generator.addSchema('Error', {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string' },
        code: { type: 'string' },
        details: { type: 'array', items: { type: 'string' } },
        timestamp: { type: 'number' }
      },
      required: ['success', 'error', 'timestamp']
    })

    this.generator.addSchema('PaginatedResponse', {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { type: 'object' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' }
          }
        },
        timestamp: { type: 'number' }
      },
      required: ['success', 'data', 'pagination', 'timestamp']
    })
  }

  private static setupSecuritySchemes(): void {
    this.generator.addSecurityScheme('bearerAuth', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token for authentication'
    })

    this.generator.addSecurityScheme('apiKey', {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
      description: 'API key for authentication'
    })
  }

  private static setupEndpoints(): void {
    // Authentication endpoints
    this.generator.addEndpoint({
      method: 'POST',
      path: '/api/auth/login',
      summary: 'User login',
      description: 'Authenticate user with email and password',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 }
              },
              required: ['email', 'password']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string' },
                      refreshToken: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        400: { $ref: '#/components/responses/BadRequest' }
      }
    })

    this.generator.addEndpoint({
      method: 'POST',
      path: '/api/auth/register',
      summary: 'User registration',
      description: 'Register a new user account',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string', enum: ['applicant', 'learner', 'admin'] }
              },
              required: ['email', 'password', 'firstName', 'lastName']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Registration successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        400: { $ref: '#/components/responses/BadRequest' },
        409: {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    })

    // User endpoints
    this.generator.addEndpoint({
      method: 'GET',
      path: '/api/users',
      summary: 'Get users',
      description: 'Retrieve a list of users with pagination and filtering',
      tags: ['Users'],
      parameters: [
        { $ref: '#/components/parameters/Page' },
        { $ref: '#/components/parameters/Limit' },
        { $ref: '#/components/parameters/Sort' },
        { $ref: '#/components/parameters/Search' },
        {
          name: 'role',
          in: 'query',
          required: false,
          schema: { type: 'string', enum: ['applicant', 'learner', 'admin', 'super-admin'] },
          description: 'Filter by user role'
        },
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: { type: 'string', enum: ['pending', 'active', 'inactive', 'suspended'] },
          description: 'Filter by user status'
        }
      ],
      responses: {
        200: {
          description: 'Users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/PaginatedResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      },
      security: [{ bearerAuth: [] }]
    })

    this.generator.addEndpoint({
      method: 'GET',
      path: '/api/users/{id}',
      summary: 'Get user by ID',
      description: 'Retrieve a specific user by their ID',
      tags: ['Users'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'User ID'
        }
      ],
      responses: {
        200: {
          description: 'User retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        404: { $ref: '#/components/responses/NotFound' },
        401: { $ref: '#/components/responses/Unauthorized' }
      },
      security: [{ bearerAuth: [] }]
    })

    // Application endpoints
    this.generator.addEndpoint({
      method: 'POST',
      path: '/api/applications',
      summary: 'Create application',
      description: 'Submit a new application',
      tags: ['Applications'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                program: { type: 'string' },
                motivation: { type: 'string' },
                experience: { type: 'string' },
                availability: { type: 'string' },
                emergencyContact: { $ref: '#/components/schemas/EmergencyContact' }
              },
              required: ['program', 'motivation', 'experience', 'availability', 'emergencyContact']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Application created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Application' }
                }
              }
            }
          }
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' }
      },
      security: [{ bearerAuth: [] }]
    })

    // Health check endpoint
    this.generator.addEndpoint({
      method: 'GET',
      path: '/api/health',
      summary: 'Health check',
      description: 'Check the health status of the API',
      tags: ['System'],
      responses: {
        200: {
          description: 'API is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'healthy' },
                  timestamp: { type: 'number' },
                  uptime: { type: 'number' },
                  version: { type: 'string' },
                  environment: { type: 'string' }
                }
              }
            }
          }
        }
      }
    })
  }
}

// Initialize API documentation
APIDefinitions.initialize()

// Export utilities
export const apiDocGenerator = APIDocumentationGenerator.getInstance()
export const generateAPIDoc = () => apiDocGenerator.generateOpenAPISpec()
