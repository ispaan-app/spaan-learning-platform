// Payment service for handling stipend payments and financial transactions
export interface PaymentOptions {
  amount: number
  currency: string
  recipientId: string
  recipientName: string
  recipientEmail: string
  description: string
  reference?: string
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  transactionId?: string
  error?: string
  status?: 'pending' | 'completed' | 'failed' | 'cancelled'
}

export interface PaymentMethod {
  id: string
  type: 'bank_transfer' | 'eft' | 'paypal' | 'stripe'
  details: {
    accountNumber?: string
    bankCode?: string
    branchCode?: string
    accountType?: string
    paypalEmail?: string
    stripeCustomerId?: string
  }
  isDefault: boolean
  verified: boolean
}

export class PaymentService {
  private static instance: PaymentService
  private isConfigured: boolean = false

  private constructor() {
    this.initializeService()
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  private initializeService() {
    // Check if payment service is configured
    this.isConfigured = !!(
      process.env.PAYMENT_API_KEY ||
      process.env.STRIPE_SECRET_KEY ||
      process.env.PAYPAL_CLIENT_ID
    )
  }

  // Process stipend payment
  async processStipendPayment(options: PaymentOptions): Promise<PaymentResult> {
    try {
      if (!this.isConfigured) {
        return this.mockPayment(options)
      }

      // In production, integrate with actual payment provider
      // This is a placeholder for real payment processing
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Simulate payment processing
      await this.simulatePaymentProcessing(paymentId, options)

      return {
        success: true,
        paymentId,
        transactionId: `txn_${paymentId}`,
        status: 'completed'
      }
    } catch (error) {
      console.error('Payment processing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  // Mock payment for development/testing
  private async mockPayment(options: PaymentOptions): Promise<PaymentResult> {
    console.log(`[MOCK PAYMENT] Processing payment for ${options.recipientName}`)
    console.log(`[MOCK PAYMENT] Amount: ${options.currency} ${options.amount}`)
    console.log(`[MOCK PAYMENT] Description: ${options.description}`)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const paymentId = `mock_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      success: true,
      paymentId,
      transactionId: `mock_txn_${paymentId}`,
      status: 'completed'
    }
  }

  // Simulate payment processing with different outcomes
  private async simulatePaymentProcessing(paymentId: string, options: PaymentOptions): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Payment processing failed due to insufficient funds')
    }
    
    // Log payment details (in production, this would be stored in database)
    console.log(`Payment processed: ${paymentId} for ${options.recipientName}`)
  }

  // Calculate stipend amount based on work hours and program
  calculateStipendAmount(
    workHours: number,
    targetHours: number,
    program: string,
    baseStipend: number = 5000
  ): number {
    const percentage = (workHours / targetHours) * 100
    
    if (percentage < 50) {
      return 0 // No stipend if less than 50% of target hours
    }
    
    let stipendMultiplier = 1
    if (percentage >= 100) {
      stipendMultiplier = 1 // Full stipend
    } else if (percentage >= 75) {
      stipendMultiplier = 0.9 // 90% of full stipend
    } else if (percentage >= 50) {
      stipendMultiplier = 0.75 // 75% of full stipend
    }
    
    // Program-specific adjustments
    const programMultipliers: Record<string, number> = {
      'software-development': 1.1,
      'data-science': 1.05,
      'cybersecurity': 1.15,
      'web-development': 1.0,
      'mobile-development': 1.05
    }
    
    const programMultiplier = programMultipliers[program] || 1.0
    
    return Math.round(baseStipend * stipendMultiplier * programMultiplier)
  }

  // Get payment history for a user
  async getPaymentHistory(userId: string): Promise<Array<{
    id: string
    amount: number
    currency: string
    description: string
    status: string
    createdAt: string
    processedAt?: string
  }>> {
    // Mock payment history
    return [
      {
        id: 'pay_001',
        amount: 5000,
        currency: 'ZAR',
        description: 'Monthly stipend - Software Development',
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pay_002',
        amount: 4500,
        currency: 'ZAR',
        description: 'Monthly stipend - Software Development (Prorated)',
        status: 'completed',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  // Add payment method
  async addPaymentMethod(
    userId: string,
    method: Omit<PaymentMethod, 'id' | 'verified'>
  ): Promise<{ success: boolean; methodId?: string; error?: string }> {
    try {
      const methodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // In production, this would be stored in database
      console.log(`Payment method added for user ${userId}:`, methodId)
      
      return {
        success: true,
        methodId
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add payment method'
      }
    }
  }

  // Get payment methods for a user
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Mock payment methods
    return [
      {
        id: 'pm_001',
        type: 'bank_transfer',
        details: {
          accountNumber: '1234567890',
          bankCode: '632005',
          branchCode: '123456',
          accountType: 'savings'
        },
        isDefault: true,
        verified: true
      }
    ]
  }

  // Verify payment method
  async verifyPaymentMethod(
    methodId: string,
    verificationCode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (verificationCode === '123456') {
        return { success: true }
      } else {
        return { success: false, error: 'Invalid verification code' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }
    }
  }

  // Refund payment
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResult> {
    try {
      console.log(`Processing refund for payment ${paymentId}`)
      
      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        success: true,
        paymentId: refundId,
        transactionId: `refund_txn_${refundId}`,
        status: 'completed'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<{
    status: string
    amount?: number
    currency?: string
    createdAt?: string
    processedAt?: string
    error?: string
  }> {
    // Mock payment status
    return {
      status: 'completed',
      amount: 5000,
      currency: 'ZAR',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    }
  }

  // Generate payment report
  async generatePaymentReport(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<{
    totalAmount: number
    totalPayments: number
    successfulPayments: number
    failedPayments: number
    averageAmount: number
    payments: Array<{
      id: string
      amount: number
      currency: string
      recipientName: string
      status: string
      createdAt: string
    }>
  }> {
    // Mock payment report
    return {
      totalAmount: 15000,
      totalPayments: 3,
      successfulPayments: 3,
      failedPayments: 0,
      averageAmount: 5000,
      payments: [
        {
          id: 'pay_001',
          amount: 5000,
          currency: 'ZAR',
          recipientName: 'John Doe',
          status: 'completed',
          createdAt: new Date().toISOString()
        }
      ]
    }
  }

  // Test payment service configuration
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Payment service not configured' }
    }

    try {
      // Test payment processing with minimal amount
      const testResult = await this.processStipendPayment({
        amount: 0.01,
        currency: 'ZAR',
        recipientId: 'test',
        recipientName: 'Test User',
        recipientEmail: 'test@example.com',
        description: 'Test payment'
      })

      return { success: testResult.success, error: testResult.error }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration test failed'
      }
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance()

// Export individual functions for easier testing
export const {
  processStipendPayment,
  calculateStipendAmount,
  getPaymentHistory,
  addPaymentMethod,
  getPaymentMethods,
  verifyPaymentMethod,
  refundPayment,
  getPaymentStatus,
  generatePaymentReport,
  testConfiguration
} = PaymentService.getInstance()

export default PaymentService
