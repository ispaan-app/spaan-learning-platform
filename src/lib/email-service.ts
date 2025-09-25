import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  body: string
  template?: string
  data?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

class EmailService {
  private static instance: EmailService
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@ispaan.com',
        to: options.to,
        subject: options.subject,
        html: options.body,
        attachments: options.attachments
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Email sent to ${options.to}`)
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail: string, userName: string, userRole: string): Promise<void> {
    const subject = 'Welcome to iSpaan!'
    const body = this.getWelcomeEmailTemplate(userName, userRole)
    
    await this.sendEmail({
      to: userEmail,
      subject,
      body
    })
  }

  // Send application status update
  async sendApplicationStatusEmail(
    userEmail: string,
    userName: string,
    status: 'approved' | 'rejected' | 'pending'
  ): Promise<void> {
    const subject = `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`
    const body = this.getApplicationStatusTemplate(userName, status)
    
    await this.sendEmail({
      to: userEmail,
      subject,
      body
    })
  }

  // Send placement notification
  async sendPlacementNotification(
    userEmail: string,
    userName: string,
    companyName: string,
    position: string
  ): Promise<void> {
    const subject = 'New Placement Assignment'
    const body = this.getPlacementNotificationTemplate(userName, companyName, position)
    
    await this.sendEmail({
      to: userEmail,
      subject,
      body
    })
  }

  // Send document verification notification
  async sendDocumentVerificationEmail(
    userEmail: string,
    userName: string,
    documentName: string,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    const subject = `Document ${status.charAt(0).toUpperCase() + status.slice(1)}`
    const body = this.getDocumentVerificationTemplate(userName, documentName, status)
    
    await this.sendEmail({
      to: userEmail,
      subject,
      body
    })
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<void> {
    const subject = 'Password Reset Request'
    const body = this.getPasswordResetTemplate(resetLink)
    
    await this.sendEmail({
      to: userEmail,
      subject,
      body
    })
  }

  // Email templates
  private getWelcomeEmailTemplate(userName: string, userRole: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to iSpaan</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to iSpaan!</h1>
            <p>Your AI-Powered Learning Platform</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Welcome to iSpaan! We're excited to have you join our learning community.</p>
            <p>Your account has been created with the role: <strong>${userRole}</strong></p>
            <p>You can now access your dashboard and start your learning journey.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Access Dashboard</a>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The iSpaan Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getApplicationStatusTemplate(userName: string, status: string): string {
    const statusColor = status === 'approved' ? '#28a745' : status === 'rejected' ? '#dc3545' : '#ffc107'
    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application ${statusText}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application ${statusText}</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Your application has been <strong>${statusText}</strong>.</p>
            ${status === 'approved' ? '<p>Congratulations! You can now access your learner dashboard.</p>' : ''}
            ${status === 'rejected' ? '<p>We appreciate your interest. Please feel free to apply again in the future.</p>' : ''}
            ${status === 'pending' ? '<p>Your application is being reviewed. We will notify you once a decision is made.</p>' : ''}
            <p>Best regards,<br>The iSpaan Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getPlacementNotificationTemplate(userName: string, companyName: string, position: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Placement Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Placement Assignment</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Great news! You have been assigned to a new placement:</p>
            <ul>
              <li><strong>Company:</strong> ${companyName}</li>
              <li><strong>Position:</strong> ${position}</li>
            </ul>
            <p>Please check your dashboard for more details and next steps.</p>
            <p>Best regards,<br>The iSpaan Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getDocumentVerificationTemplate(userName: string, documentName: string, status: string): string {
    const statusColor = status === 'approved' ? '#28a745' : '#dc3545'
    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Document ${statusText}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Document ${statusText}</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Your document "${documentName}" has been <strong>${statusText}</strong>.</p>
            ${status === 'approved' ? '<p>Your document is now verified and on file.</p>' : ''}
            ${status === 'rejected' ? '<p>Please upload a new document that meets our requirements.</p>' : ''}
            <p>Best regards,<br>The iSpaan Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getPasswordResetTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Password Reset</h2>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <p>Best regards,<br>The iSpaan Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const emailService = EmailService.getInstance()
export const sendEmail = emailService.sendEmail.bind(emailService)