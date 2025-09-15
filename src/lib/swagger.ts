import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'iSpaan API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the iSpaan AI-Powered App',
      contact: {
        name: 'iSpaan Development Team',
        email: 'dev@ispaan.co.za',
        url: 'https://ispaan.co.za'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.ispaan.co.za',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service communication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'firstName', 'lastName', 'email', 'role', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: 'user123'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['applicant', 'learner', 'admin', 'super-admin'],
              description: 'User role in the system'
            },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'suspended'],
              description: 'User account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Applicant: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              type: 'object',
              required: ['idNumber', 'phone', 'program', 'address'],
              properties: {
                idNumber: {
                  type: 'string',
                  pattern: '^[0-9]{13}$',
                  description: 'South African ID number',
                  example: '1234567890123'
                },
                phone: {
                  type: 'string',
                  pattern: '^[0-9]{10}$',
                  description: 'Phone number',
                  example: '1234567890'
                },
                program: {
                  type: 'string',
                  description: 'Program of interest',
                  example: 'Software Development'
                },
                address: {
                  type: 'object',
                  required: ['street', 'city', 'province', 'postalCode', 'country'],
                  properties: {
                    street: { type: 'string', example: '123 Main St' },
                    city: { type: 'string', example: 'Cape Town' },
                    province: { type: 'string', example: 'Western Cape' },
                    postalCode: { type: 'string', example: '8000' },
                    country: { type: 'string', example: 'South Africa' }
                  }
                },
                qualifications: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Educational qualifications',
                  example: ['Bachelor of Science']
                },
                experience: {
                  type: 'string',
                  description: 'Work experience description',
                  example: '5 years of software development experience'
                },
                skills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Technical skills',
                  example: ['JavaScript', 'React', 'Node.js']
                }
              }
            }
          ]
        },
        Learner: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              type: 'object',
              properties: {
                placementId: {
                  type: 'string',
                  description: 'Assigned placement ID',
                  example: 'placement123'
                },
                monthlyHours: {
                  type: 'number',
                  description: 'Hours logged this month',
                  example: 120
                },
                targetHours: {
                  type: 'number',
                  description: 'Target hours per month',
                  example: 160
                }
              }
            }
          ]
        },
        Placement: {
          type: 'object',
          required: ['id', 'companyName', 'role', 'location', 'capacity', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique placement identifier',
              example: 'placement123'
            },
            companyName: {
              type: 'string',
              description: 'Company name',
              example: 'Tech Corp'
            },
            role: {
              type: 'string',
              description: 'Job role',
              example: 'Software Developer'
            },
            description: {
              type: 'string',
              description: 'Job description',
              example: 'Full-stack development position'
            },
            location: {
              type: 'string',
              description: 'Work location',
              example: 'Cape Town, South Africa'
            },
            capacity: {
              type: 'number',
              description: 'Maximum number of learners',
              example: 5
            },
            assignedLearners: {
              type: 'number',
              description: 'Number of currently assigned learners',
              example: 3
            },
            status: {
              type: 'string',
              enum: ['active', 'full', 'inactive'],
              description: 'Placement status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        WorkHours: {
          type: 'object',
          required: ['id', 'learnerId', 'date', 'hours', 'description', 'location'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique work hours identifier',
              example: 'hours123'
            },
            learnerId: {
              type: 'string',
              description: 'Learner ID',
              example: 'learner123'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Work date',
              example: '2024-01-15'
            },
            hours: {
              type: 'number',
              minimum: 0,
              maximum: 24,
              description: 'Hours worked',
              example: 8
            },
            description: {
              type: 'string',
              description: 'Work description',
              example: 'Worked on project development'
            },
            location: {
              type: 'string',
              description: 'Work location',
              example: 'Office'
            },
            verified: {
              type: 'boolean',
              description: 'Verification status',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        LeaveRequest: {
          type: 'object',
          required: ['id', 'learnerId', 'type', 'startDate', 'endDate', 'reason', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique leave request identifier',
              example: 'leave123'
            },
            learnerId: {
              type: 'string',
              description: 'Learner ID',
              example: 'learner123'
            },
            type: {
              type: 'string',
              enum: ['sick', 'personal', 'emergency', 'other'],
              description: 'Leave type'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Leave start date',
              example: '2024-01-15'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Leave end date',
              example: '2024-01-17'
            },
            reason: {
              type: 'string',
              description: 'Leave reason',
              example: 'I am feeling unwell and need to rest'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'Request status'
            },
            requestedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Request timestamp'
            }
          }
        },
        Document: {
          type: 'object',
          required: ['id', 'userId', 'type', 'fileName', 'fileSize', 'fileUrl', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique document identifier',
              example: 'doc123'
            },
            userId: {
              type: 'string',
              description: 'User ID',
              example: 'user123'
            },
            type: {
              type: 'string',
              enum: ['cv', 'id', 'certificate', 'transcript', 'other'],
              description: 'Document type'
            },
            fileName: {
              type: 'string',
              description: 'Original file name',
              example: 'john-doe-cv.pdf'
            },
            fileSize: {
              type: 'number',
              description: 'File size in bytes',
              example: 1024000
            },
            fileUrl: {
              type: 'string',
              format: 'uri',
              description: 'File download URL',
              example: 'https://storage.googleapis.com/bucket/john-doe-cv.pdf'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'Document status'
            },
            uploadedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp'
            }
          }
        },
        Announcement: {
          type: 'object',
          required: ['id', 'title', 'content', 'targetAudience', 'priority', 'published'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique announcement identifier',
              example: 'announcement123'
            },
            title: {
              type: 'string',
              description: 'Announcement title',
              example: 'System Maintenance'
            },
            content: {
              type: 'string',
              description: 'Announcement content',
              example: 'The system will be under maintenance on Sunday from 2 AM to 4 AM.'
            },
            targetAudience: {
              type: 'string',
              enum: ['all', 'learners', 'admins', 'applicants'],
              description: 'Target audience'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Announcement priority'
            },
            published: {
              type: 'boolean',
              description: 'Publication status'
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Publication timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        AuditLog: {
          type: 'object',
          required: ['id', 'userId', 'userRole', 'action', 'category', 'severity', 'timestamp'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique audit log identifier',
              example: 'audit123'
            },
            userId: {
              type: 'string',
              description: 'User ID who performed the action',
              example: 'user123'
            },
            userRole: {
              type: 'string',
              enum: ['applicant', 'learner', 'admin', 'super-admin', 'system'],
              description: 'User role'
            },
            action: {
              type: 'string',
              description: 'Action performed',
              example: 'LOGIN_SUCCESS'
            },
            category: {
              type: 'string',
              enum: ['AUTH', 'USER', 'DATA', 'SYSTEM', 'SECURITY'],
              description: 'Action category'
            },
            severity: {
              type: 'string',
              enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
              description: 'Log severity'
            },
            details: {
              type: 'string',
              description: 'Additional details',
              example: 'User logged in successfully'
            },
            ipAddress: {
              type: 'string',
              format: 'ipv4',
              description: 'IP address',
              example: '192.168.1.1'
            },
            userAgent: {
              type: 'string',
              description: 'User agent string',
              example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Action timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              required: ['message', 'code', 'timestamp'],
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Invalid credentials'
                },
                code: {
                  type: 'string',
                  description: 'Error code',
                  example: 'INVALID_CREDENTIALS'
                },
                details: {
                  type: 'object',
                  description: 'Additional error details'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Error timestamp'
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'Unauthorized',
                  code: 'UNAUTHORIZED',
                  details: null,
                  timestamp: '2024-01-15T10:00:00Z'
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'Forbidden',
                  code: 'FORBIDDEN',
                  details: null,
                  timestamp: '2024-01-15T10:00:00Z'
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'Not found',
                  code: 'NOT_FOUND',
                  details: null,
                  timestamp: '2024-01-15T10:00:00Z'
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'Validation failed',
                  code: 'VALIDATION_ERROR',
                  details: ['Email is required', 'Password must be at least 8 characters'],
                  timestamp: '2024-01-15T10:00:00Z'
                }
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'Rate limit exceeded',
                  code: 'RATE_LIMITED',
                  details: { retryAfter: 60 },
                  timestamp: '2024-01-15T10:00:00Z'
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
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  message: 'Internal server error',
                  code: 'INTERNAL_ERROR',
                  details: null,
                  timestamp: '2024-01-15T10:00:00Z'
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Applications',
        description: 'Application form and review operations'
      },
      {
        name: 'Learners',
        description: 'Learner-specific operations'
      },
      {
        name: 'Placements',
        description: 'Work placement management'
      },
      {
        name: 'Work Hours',
        description: 'Work hours tracking and management'
      },
      {
        name: 'Leave Requests',
        description: 'Leave request management'
      },
      {
        name: 'Documents',
        description: 'Document upload and management'
      },
      {
        name: 'Announcements',
        description: 'Announcement management'
      },
      {
        name: 'Audit Logs',
        description: 'Audit logging and monitoring'
      },
      {
        name: 'AI Features',
        description: 'AI-powered features and integrations'
      },
      {
        name: 'Performance',
        description: 'Performance monitoring and metrics'
      },
      {
        name: 'Security',
        description: 'Security monitoring and management'
      }
    ]
  },
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/**/*.js'
  ]
}

export const swaggerSpec = swaggerJSDoc(options)
export default swaggerSpec

