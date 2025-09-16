// Comprehensive workflow automation system for business processes

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  status: WorkflowStatus
  triggers: WorkflowTrigger[]
  steps: WorkflowStep[]
  variables: WorkflowVariable[]
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  errorHandling: ErrorHandlingConfig
  timeout: number
  retryPolicy: RetryPolicy
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived' | 'error'

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  name: string
  description: string
  config: TriggerConfig
  enabled: boolean
  conditions?: WorkflowCondition[]
}

export type TriggerType = 
  | 'webhook' 
  | 'schedule' 
  | 'event' 
  | 'manual' 
  | 'file_upload' 
  | 'data_change' 
  | 'user_action' 
  | 'api_call'

export interface TriggerConfig {
  url?: string
  method?: string
  headers?: Record<string, string>
  cron?: string
  event?: string
  conditions?: Record<string, any>
  timeout?: number
}

export interface WorkflowStep {
  id: string
  name: string
  type: StepType
  description: string
  config: StepConfig
  conditions?: WorkflowCondition[]
  actions?: WorkflowAction[]
  onSuccess?: string[]
  onFailure?: string[]
  onTimeout?: string[]
  timeout?: number
  retryPolicy?: RetryPolicy
  parallel?: boolean
  waitFor?: string[]
}

export type StepType = 
  | 'start' 
  | 'end' 
  | 'task' 
  | 'decision' 
  | 'parallel' 
  | 'merge' 
  | 'timer' 
  | 'user_task' 
  | 'service_task' 
  | 'script' 
  | 'subprocess' 
  | 'event' 
  | 'gateway'

export interface StepConfig {
  taskType?: string
  script?: string
  service?: string
  endpoint?: string
  method?: string
  headers?: Record<string, string>
  body?: any
  parameters?: Record<string, any>
  assignee?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  form?: FormConfig
  conditions?: Record<string, any>
}

export interface FormConfig {
  fields: FormField[]
  validation: ValidationRule[]
  layout: FormLayout
  submitAction: string
}

export interface FormField {
  id: string
  name: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file'
  label: string
  required: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: ValidationRule[]
}

export interface FormLayout {
  type: 'single' | 'multi-column' | 'tabs' | 'accordion'
  columns?: number
  sections?: FormSection[]
}

export interface FormSection {
  title: string
  fields: string[]
  collapsible?: boolean
  expanded?: boolean
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom'
  value?: any
  message: string
  validator?: string
}

export interface WorkflowVariable {
  id: string
  name: string
  type: VariableType
  value: any
  required: boolean
  description?: string
  defaultValue?: any
  validation?: ValidationRule[]
}

export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'

export interface WorkflowCondition {
  id: string
  name: string
  expression: string
  description?: string
  variables: string[]
  operator: ConditionOperator
  value: any
  logic?: 'and' | 'or'
}

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with' 
  | 'is_empty' 
  | 'is_not_empty' 
  | 'in' 
  | 'not_in' 
  | 'regex' 
  | 'custom'

export interface WorkflowAction {
  id: string
  name: string
  type: ActionType
  description: string
  config: ActionConfig
  conditions?: WorkflowCondition[]
  onSuccess?: string[]
  onFailure?: string[]
  timeout?: number
  retryPolicy?: RetryPolicy
}

export type ActionType = 
  | 'send_email' 
  | 'send_notification' 
  | 'create_task' 
  | 'update_data' 
  | 'call_api' 
  | 'execute_script' 
  | 'send_sms' 
  | 'create_document' 
  | 'schedule_event' 
  | 'trigger_workflow' 
  | 'update_status' 
  | 'assign_user' 
  | 'log_event' 
  | 'custom'

export interface ActionConfig {
  template?: string
  recipients?: string[]
  subject?: string
  body?: string
  endpoint?: string
  method?: string
  headers?: Record<string, string>
  data?: any
  script?: string
  parameters?: Record<string, any>
  delay?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface ErrorHandlingConfig {
  strategy: 'stop' | 'continue' | 'retry' | 'skip' | 'rollback'
  maxRetries: number
  retryDelay: number
  fallbackAction?: string
  notificationRecipients?: string[]
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

export interface RetryPolicy {
  maxAttempts: number
  delay: number
  backoffMultiplier: number
  maxDelay: number
  retryableErrors: string[]
}

export interface WorkflowInstance {
  id: string
  workflowId: string
  status: InstanceStatus
  currentStep?: string
  variables: Record<string, any>
  context: WorkflowContext
  startedAt: Date
  completedAt?: Date
  lastActivityAt: Date
  error?: string
  retryCount: number
  metadata: Record<string, any>
  history: WorkflowHistoryEntry[]
}

export type InstanceStatus = 'running' | 'completed' | 'failed' | 'paused' | 'cancelled' | 'timeout'

export interface WorkflowContext {
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  source: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  metadata: Record<string, any>
}

export interface WorkflowHistoryEntry {
  id: string
  stepId: string
  stepName: string
  action: 'started' | 'completed' | 'failed' | 'skipped' | 'retried'
  timestamp: Date
  duration?: number
  error?: string
  variables?: Record<string, any>
  metadata?: Record<string, any>
}

export interface WorkflowExecutionResult {
  success: boolean
  instanceId: string
  duration: number
  stepsExecuted: number
  stepsSkipped: number
  stepsFailed: number
  error?: string
  output?: Record<string, any>
}

class WorkflowEngine {
  private static instance: WorkflowEngine
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private instances: Map<string, WorkflowInstance> = new Map()
  private triggers: Map<string, WorkflowTrigger> = new Map()
  private config: WorkflowConfig

  constructor() {
    this.config = {
      maxConcurrentInstances: 100,
      defaultTimeout: 300000, // 5 minutes
      retryDelay: 1000, // 1 second
      maxRetries: 3,
      cleanupInterval: 3600000, // 1 hour
      enableLogging: true,
      enableMetrics: true
    }
  }

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine()
    }
    return WorkflowEngine.instance
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    const id = this.generateWorkflowId()
    const now = new Date()
    
    const newWorkflow: WorkflowDefinition = {
      ...workflow,
      id,
      createdAt: now,
      updatedAt: now
    }

    this.workflows.set(id, newWorkflow)

    // Register triggers
    for (const trigger of workflow.triggers) {
      this.triggers.set(trigger.id, trigger)
    }

    console.log(`Workflow created: ${id}`)
    return newWorkflow
  }

  async updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const workflow = this.workflows.get(id)
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`)
    }

    const updatedWorkflow: WorkflowDefinition = {
      ...workflow,
      ...updates,
      id,
      updatedAt: new Date()
    }

    this.workflows.set(id, updatedWorkflow)
    console.log(`Workflow updated: ${id}`)
    return updatedWorkflow
  }

  async deleteWorkflow(id: string): Promise<void> {
    const workflow = this.workflows.get(id)
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`)
    }

    // Check if workflow has running instances
    const runningInstances = Array.from(this.instances.values())
      .filter(instance => instance.workflowId === id && instance.status === 'running')

    if (runningInstances.length > 0) {
      throw new Error(`Cannot delete workflow with running instances: ${runningInstances.length}`)
    }

    this.workflows.delete(id)
    console.log(`Workflow deleted: ${id}`)
  }

  async executeWorkflow(
    workflowId: string,
    context: WorkflowContext,
    variables: Record<string, any> = {}
  ): Promise<WorkflowExecutionResult> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow is not active: ${workflow.status}`)
    }

    const instanceId = this.generateInstanceId()
    const startTime = Date.now()

    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      status: 'running',
      variables: { ...workflow.variables.reduce((acc, v) => ({ ...acc, [v.name]: v.value }), {}), ...variables },
      context,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      retryCount: 0,
      metadata: {},
      history: []
    }

    this.instances.set(instanceId, instance)

    try {
      console.log(`Executing workflow: ${workflowId}, instance: ${instanceId}`)

      // Execute workflow steps
      const result = await this.executeWorkflowSteps(workflow, instance)

      instance.status = 'completed'
      instance.completedAt = new Date()
      instance.lastActivityAt = new Date()

      const duration = Date.now() - startTime

      console.log(`Workflow completed: ${instanceId} in ${duration}ms`)

      return {
        success: true,
        instanceId,
        duration,
        stepsExecuted: result.stepsExecuted,
        stepsSkipped: result.stepsSkipped,
        stepsFailed: result.stepsFailed,
        output: instance.variables
      }
    } catch (error) {
      instance.status = 'failed'
      instance.error = error instanceof Error ? error.message : 'Unknown error'
      instance.completedAt = new Date()
      instance.lastActivityAt = new Date()

      const duration = Date.now() - startTime

      console.error(`Workflow failed: ${instanceId}`, error)

      return {
        success: false,
        instanceId,
        duration,
        stepsExecuted: 0,
        stepsSkipped: 0,
        stepsFailed: 1,
        error: instance.error
      }
    }
  }

  private async executeWorkflowSteps(
    workflow: WorkflowDefinition,
    instance: WorkflowInstance
  ): Promise<{ stepsExecuted: number; stepsSkipped: number; stepsFailed: number }> {
    let stepsExecuted = 0
    let stepsSkipped = 0
    let stepsFailed = 0

    const startStep = workflow.steps.find(step => step.type === 'start')
    if (!startStep) {
      throw new Error('Workflow must have a start step')
    }

    const stepQueue: WorkflowStep[] = [startStep]
    const completedSteps = new Set<string>()

    while (stepQueue.length > 0) {
      const currentStep = stepQueue.shift()!
      
      if (completedSteps.has(currentStep.id)) {
        continue
      }

      try {
        // Check step conditions
        if (currentStep.conditions && !this.evaluateConditions(currentStep.conditions, instance)) {
          stepsSkipped++
          this.addHistoryEntry(instance, currentStep, 'skipped')
          continue
        }

        // Execute step
        await this.executeStep(currentStep, instance)
        stepsExecuted++
        completedSteps.add(currentStep.id)

        this.addHistoryEntry(instance, currentStep, 'completed')

        // Add next steps to queue
        if (currentStep.onSuccess) {
          for (const nextStepId of currentStep.onSuccess) {
            const nextStep = workflow.steps.find(step => step.id === nextStepId)
            if (nextStep && !completedSteps.has(nextStep.id)) {
              stepQueue.push(nextStep)
            }
          }
        }
      } catch (error) {
        stepsFailed++
        this.addHistoryEntry(instance, currentStep, 'failed', error instanceof Error ? error.message : 'Unknown error')

        // Handle step failure
        if (currentStep.onFailure) {
          for (const nextStepId of currentStep.onFailure) {
            const nextStep = workflow.steps.find(step => step.id === nextStepId)
            if (nextStep && !completedSteps.has(nextStep.id)) {
              stepQueue.push(nextStep)
            }
          }
        } else {
          throw error
        }
      }
    }

    return { stepsExecuted, stepsSkipped, stepsFailed }
  }

  private async executeStep(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    console.log(`Executing step: ${step.name} (${step.type})`)

    switch (step.type) {
      case 'start':
        // Start step - no action needed
        break

      case 'end':
        // End step - workflow will complete
        break

      case 'task':
        await this.executeTask(step, instance)
        break

      case 'decision':
        await this.executeDecision(step, instance)
        break

      case 'user_task':
        await this.executeUserTask(step, instance)
        break

      case 'service_task':
        await this.executeServiceTask(step, instance)
        break

      case 'script':
        await this.executeScript(step, instance)
        break

      case 'timer':
        await this.executeTimer(step, instance)
        break

      case 'event':
        await this.executeEvent(step, instance)
        break

      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  private async executeTask(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    // In a real implementation, this would execute the task
    console.log(`Executing task: ${step.name}`)
  }

  private async executeDecision(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    // In a real implementation, this would evaluate decision conditions
    console.log(`Executing decision: ${step.name}`)
  }

  private async executeUserTask(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    // In a real implementation, this would create a user task
    console.log(`Executing user task: ${step.name}`)
  }

  private async executeServiceTask(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    // In a real implementation, this would call an external service
    console.log(`Executing service task: ${step.name}`)
  }

  private async executeScript(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    // In a real implementation, this would execute the script
    console.log(`Executing script: ${step.name}`)
  }

  private async executeTimer(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    // In a real implementation, this would wait for the specified time
    console.log(`Executing timer: ${step.name}`)
  }

  private async executeEvent(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    // In a real implementation, this would wait for an event
    console.log(`Executing event: ${step.name}`)
  }

  private evaluateConditions(conditions: WorkflowCondition[], instance: WorkflowInstance): boolean {
    // In a real implementation, this would evaluate the conditions
    return true
  }

  private addHistoryEntry(
    instance: WorkflowInstance,
    step: WorkflowStep,
    action: 'started' | 'completed' | 'failed' | 'skipped' | 'retried',
    error?: string
  ): void {
    const entry: WorkflowHistoryEntry = {
      id: this.generateHistoryId(),
      stepId: step.id,
      stepName: step.name,
      action,
      timestamp: new Date(),
      error,
      variables: { ...instance.variables }
    }

    instance.history.push(entry)
    instance.lastActivityAt = new Date()
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateInstanceId(): string {
    return `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values())
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id)
  }

  getInstances(): WorkflowInstance[] {
    return Array.from(this.instances.values())
  }

  getInstance(id: string): WorkflowInstance | undefined {
    return this.instances.get(id)
  }

  getWorkflowStats(): {
    totalWorkflows: number
    activeWorkflows: number
    totalInstances: number
    runningInstances: number
    completedInstances: number
    failedInstances: number
  } {
    const workflows = this.getWorkflows()
    const instances = this.getInstances()

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'active').length,
      totalInstances: instances.length,
      runningInstances: instances.filter(i => i.status === 'running').length,
      completedInstances: instances.filter(i => i.status === 'completed').length,
      failedInstances: instances.filter(i => i.status === 'failed').length
    }
  }
}

export interface WorkflowConfig {
  maxConcurrentInstances: number
  defaultTimeout: number
  retryDelay: number
  maxRetries: number
  cleanupInterval: number
  enableLogging: boolean
  enableMetrics: boolean
}

// Predefined workflow templates
export class WorkflowTemplates {
  static getApplicationReviewWorkflow(): Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'Application Review Workflow',
      description: 'Automated workflow for reviewing and processing applications',
      version: '1.0.0',
      status: 'active',
      triggers: [
        {
          id: 'app_submitted',
          type: 'event',
          name: 'Application Submitted',
          description: 'Triggered when a new application is submitted',
          config: {
            event: 'application.submitted'
          },
          enabled: true
        }
      ],
      steps: [
        {
          id: 'start',
          name: 'Start',
          type: 'start',
          description: 'Workflow start',
          config: {}
        },
        {
          id: 'initial_review',
          name: 'Initial Review',
          type: 'task',
          description: 'Initial review of application',
          config: {
            taskType: 'review',
            assignee: 'admin',
            priority: 'medium'
          }
        },
        {
          id: 'decision',
          name: 'Review Decision',
          type: 'decision',
          description: 'Make review decision',
          config: {
            conditions: {
              status: ['approved', 'rejected', 'needs_more_info']
            }
          }
        },
        {
          id: 'notify_applicant',
          name: 'Notify Applicant',
          type: 'task',
          description: 'Notify applicant of decision',
          config: {
            taskType: 'notification',
            template: 'application_decision'
          }
        },
        {
          id: 'end',
          name: 'End',
          type: 'end',
          description: 'Workflow end',
          config: {}
        }
      ],
      variables: [
        {
          id: 'application_id',
          name: 'applicationId',
          type: 'string',
          value: '',
          required: true
        },
        {
          id: 'reviewer_id',
          name: 'reviewerId',
          type: 'string',
          value: '',
          required: true
        }
      ],
      conditions: [],
      actions: [],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 3,
        retryDelay: 5000,
        logLevel: 'error'
      },
      timeout: 3600000, // 1 hour
      retryPolicy: {
        maxAttempts: 3,
        delay: 1000,
        backoffMultiplier: 2,
        maxDelay: 10000,
        retryableErrors: ['timeout', 'network_error']
      },
      metadata: {},
      createdBy: 'system',
      updatedBy: 'system'
    }
  }

  static getPlacementWorkflow(): Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'Placement Workflow',
      description: 'Automated workflow for managing learner placements',
      version: '1.0.0',
      status: 'active',
      triggers: [
        {
          id: 'placement_created',
          type: 'event',
          name: 'Placement Created',
          description: 'Triggered when a new placement is created',
          config: {
            event: 'placement.created'
          },
          enabled: true
        }
      ],
      steps: [
        {
          id: 'start',
          name: 'Start',
          type: 'start',
          description: 'Workflow start',
          config: {}
        },
        {
          id: 'assign_supervisor',
          name: 'Assign Supervisor',
          type: 'task',
          description: 'Assign supervisor to placement',
          config: {
            taskType: 'assignment',
            assignee: 'admin'
          }
        },
        {
          id: 'send_welcome_email',
          name: 'Send Welcome Email',
          type: 'task',
          description: 'Send welcome email to learner',
          config: {
            taskType: 'email',
            template: 'placement_welcome'
          }
        },
        {
          id: 'schedule_orientation',
          name: 'Schedule Orientation',
          type: 'task',
          description: 'Schedule orientation meeting',
          config: {
            taskType: 'scheduling',
            assignee: 'supervisor'
          }
        },
        {
          id: 'end',
          name: 'End',
          type: 'end',
          description: 'Workflow end',
          config: {}
        }
      ],
      variables: [
        {
          id: 'placement_id',
          name: 'placementId',
          type: 'string',
          value: '',
          required: true
        },
        {
          id: 'learner_id',
          name: 'learnerId',
          type: 'string',
          value: '',
          required: true
        },
        {
          id: 'company_id',
          name: 'companyId',
          type: 'string',
          value: '',
          required: true
        }
      ],
      conditions: [],
      actions: [],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 3,
        retryDelay: 5000,
        logLevel: 'error'
      },
      timeout: 7200000, // 2 hours
      retryPolicy: {
        maxAttempts: 3,
        delay: 1000,
        backoffMultiplier: 2,
        maxDelay: 10000,
        retryableErrors: ['timeout', 'network_error']
      },
      metadata: {},
      createdBy: 'system',
      updatedBy: 'system'
    }
  }
}

// Export singleton instance
export const workflowEngine = WorkflowEngine.getInstance()
