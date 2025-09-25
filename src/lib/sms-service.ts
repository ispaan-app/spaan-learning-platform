interface SMSOptions {
  to: string
  message: string
}

class SMSService {
  private static instance: SMSService

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService()
    }
    return SMSService.instance
  }

  // Send SMS using Twilio or similar service
  async sendSMS(options: SMSOptions): Promise<void> {
    try {
      // For now, we'll use a mock implementation
      // In production, integrate with Twilio, AWS SNS, or similar
      console.log(`SMS sent to ${options.to}: ${options.message}`)
      
      // TODO: Implement actual SMS service
      // Example with Twilio:
      // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      // await client.messages.create({
      //   body: options.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: options.to
      // })
    } catch (error) {
      console.error('Error sending SMS:', error)
      throw error
    }
  }

  // Send welcome SMS
  async sendWelcomeSMS(phoneNumber: string, userName: string): Promise<void> {
    const message = `Welcome to iSpaan, ${userName}! Your account is ready. Visit ${process.env.NEXT_PUBLIC_APP_URL} to get started.`
    await this.sendSMS({ to: phoneNumber, message })
  }

  // Send application status SMS
  async sendApplicationStatusSMS(
    phoneNumber: string,
    userName: string,
    status: 'approved' | 'rejected' | 'pending'
  ): Promise<void> {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    const message = `Hi ${userName}, your application has been ${statusText}. Check your dashboard for details.`
    await this.sendSMS({ to: phoneNumber, message })
  }

  // Send placement notification SMS
  async sendPlacementNotificationSMS(
    phoneNumber: string,
    userName: string,
    companyName: string
  ): Promise<void> {
    const message = `Hi ${userName}, you've been assigned to ${companyName}. Check your dashboard for details.`
    await this.sendSMS({ to: phoneNumber, message })
  }

  // Send attendance reminder SMS
  async sendAttendanceReminderSMS(phoneNumber: string, userName: string): Promise<void> {
    const message = `Hi ${userName}, don't forget to check in for your placement today!`
    await this.sendSMS({ to: phoneNumber, message })
  }

  // Send document verification SMS
  async sendDocumentVerificationSMS(
    phoneNumber: string,
    userName: string,
    documentName: string,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    const message = `Hi ${userName}, your document "${documentName}" has been ${statusText}.`
    await this.sendSMS({ to: phoneNumber, message })
  }
}

export const smsService = SMSService.getInstance()
export const sendSMS = smsService.sendSMS.bind(smsService)
