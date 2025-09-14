// Email service integration for iSpaan
import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured = false

  constructor() {
    this.initializeTransporter()
  }

  private async initializeTransporter() {
    try {
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }

      if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.warn('Email service not configured: Missing SMTP credentials')
        return
      }

      this.transporter = nodemailer.createTransport(smtpConfig)
      
      // Verify connection
      await this.transporter.verify()
      this.isConfigured = true
      console.log('Email service configured successfully')
    } catch (error) {
      console.error('Failed to configure email service:', error)
      this.isConfigured = false
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured, skipping email send')
      return false
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Application approval email
  async sendApplicationApprovalEmail(userEmail: string, userName: string) {
    const template = this.getApplicationApprovalTemplate(userName)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Application rejection email
  async sendApplicationRejectionEmail(userEmail: string, userName: string, reason?: string) {
    const template = this.getApplicationRejectionTemplate(userName, reason)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // PIN reset email
  async sendPinResetEmail(userEmail: string, userName: string, newPin: string) {
    const template = this.getPinResetTemplate(userName, newPin)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Document approval email
  async sendDocumentApprovalEmail(userEmail: string, userName: string, documentType: string) {
    const template = this.getDocumentApprovalTemplate(userName, documentType)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Document rejection email
  async sendDocumentRejectionEmail(userEmail: string, userName: string, documentType: string, reason: string) {
    const template = this.getDocumentRejectionTemplate(userName, documentType, reason)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Leave request approval email
  async sendLeaveApprovalEmail(userEmail: string, userName: string, leaveDetails: any) {
    const template = this.getLeaveApprovalTemplate(userName, leaveDetails)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Leave request rejection email
  async sendLeaveRejectionEmail(userEmail: string, userName: string, leaveDetails: any, reason: string) {
    const template = this.getLeaveRejectionTemplate(userName, leaveDetails, reason)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Announcement email
  async sendAnnouncementEmail(recipients: string[], announcement: any) {
    const template = this.getAnnouncementTemplate(announcement)
    
    return await this.sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string) {
    const template = this.getPasswordResetTemplate(userName, resetToken)
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Email templates
  private getApplicationApprovalTemplate(userName: string): EmailTemplate {
    return {
      subject: '🎉 Application Approved - Welcome to iSpaan!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Congratulations, ${userName}!</h1>
          <p>Your application to the iSpaan Learning Platform has been approved!</p>
          <p>You are now officially a learner and can access all platform features.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Next Steps:</h3>
            <ul>
              <li>Log in to your dashboard</li>
              <li>Complete your profile setup</li>
              <li>Upload required documents</li>
              <li>Start your learning journey!</li>
            </ul>
          </div>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Congratulations, ${userName}! Your application to the iSpaan Learning Platform has been approved. You are now officially a learner and can access all platform features.`
    }
  }

  private getApplicationRejectionTemplate(userName: string, reason?: string): EmailTemplate {
    return {
      subject: 'Application Status Update - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Application Update</h1>
          <p>Dear ${userName},</p>
          <p>Thank you for your interest in the iSpaan Learning Platform. After careful review, we regret to inform you that your application was not approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>We encourage you to reapply in the future when you meet the requirements.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Dear ${userName}, Thank you for your interest in the iSpaan Learning Platform. After careful review, we regret to inform you that your application was not approved at this time. ${reason ? `Reason: ${reason}` : ''}`
    }
  }

  private getPinResetTemplate(userName: string, newPin: string): EmailTemplate {
    return {
      subject: 'PIN Reset - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">PIN Reset</h1>
          <p>Dear ${userName},</p>
          <p>Your PIN has been reset by an administrator.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your New PIN:</h3>
            <p style="font-size: 24px; font-weight: bold; color: #4F46E5;">${newPin}</p>
          </div>
          <p>Please log in with your ID number and this new PIN. For security reasons, we recommend changing your PIN after your first login.</p>
          <p>If you did not request this reset, please contact our support team immediately.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Dear ${userName}, Your PIN has been reset by an administrator. Your new PIN is: ${newPin}. Please log in with your ID number and this new PIN.`
    }
  }

  private getDocumentApprovalTemplate(userName: string, documentType: string): EmailTemplate {
    return {
      subject: 'Document Approved - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Document Approved</h1>
          <p>Dear ${userName},</p>
          <p>Your ${documentType} document has been approved by our team.</p>
          <p>You can continue with your application process or access your learner dashboard.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Dear ${userName}, Your ${documentType} document has been approved by our team.`
    }
  }

  private getDocumentRejectionTemplate(userName: string, documentType: string, reason: string): EmailTemplate {
    return {
      subject: 'Document Rejected - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Document Rejected</h1>
          <p>Dear ${userName},</p>
          <p>Your ${documentType} document has been rejected and needs to be resubmitted.</p>
          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Reason for Rejection:</h3>
            <p>${reason}</p>
          </div>
          <p>Please upload a new document that meets our requirements.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Dear ${userName}, Your ${documentType} document has been rejected. Reason: ${reason}. Please upload a new document that meets our requirements.`
    }
  }

  private getLeaveApprovalTemplate(userName: string, leaveDetails: any): EmailTemplate {
    return {
      subject: 'Leave Request Approved - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Leave Request Approved</h1>
          <p>Dear ${userName},</p>
          <p>Your leave request has been approved.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Leave Details:</h3>
            <p><strong>Type:</strong> ${leaveDetails.type}</p>
            <p><strong>Start Date:</strong> ${leaveDetails.startDate}</p>
            <p><strong>End Date:</strong> ${leaveDetails.endDate}</p>
            <p><strong>Reason:</strong> ${leaveDetails.reason}</p>
          </div>
          <p>Please ensure you complete any pending work before your leave begins.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Dear ${userName}, Your leave request has been approved. Type: ${leaveDetails.type}, Start: ${leaveDetails.startDate}, End: ${leaveDetails.endDate}`
    }
  }

  private getLeaveRejectionTemplate(userName: string, leaveDetails: any, reason: string): EmailTemplate {
    return {
      subject: 'Leave Request Rejected - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Leave Request Rejected</h1>
          <p>Dear ${userName},</p>
          <p>Your leave request has been rejected.</p>
          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Request Details:</h3>
            <p><strong>Type:</strong> ${leaveDetails.type}</p>
            <p><strong>Start Date:</strong> ${leaveDetails.startDate}</p>
            <p><strong>End Date:</strong> ${leaveDetails.endDate}</p>
            <p><strong>Reason for Rejection:</strong> ${reason}</p>
          </div>
          <p>Please contact your supervisor if you have any questions.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Dear ${userName}, Your leave request has been rejected. Reason: ${reason}`
    }
  }

  private getAnnouncementTemplate(announcement: any): EmailTemplate {
    return {
      subject: announcement.title || 'Important Announcement - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">${announcement.title || 'Important Announcement'}</h1>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${announcement.content}
          </div>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `${announcement.title || 'Important Announcement'}\n\n${announcement.content}`
    }
  }

  private getPasswordResetTemplate(userName: string, resetToken: string): EmailTemplate {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    
    return {
      subject: 'Password Reset - iSpaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Password Reset Request</h1>
          <p>Dear ${userName},</p>
          <p>You have requested to reset your password for your iSpaan account.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you did not request this reset, please ignore this email.</p>
          <p>Best regards,<br>The iSpaan Team</p>
        </div>
      `,
      text: `Dear ${userName}, You have requested to reset your password. Click this link to reset: ${resetUrl}`
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConfigured) {
      return { status: 'not_configured', error: 'Email service not configured' }
    }

    try {
      if (this.transporter) {
        await this.transporter.verify()
        return { status: 'healthy', error: null }
      }
      return { status: 'error', error: 'Transporter not initialized' }
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Singleton instance
export const emailService = new EmailService()

// Export types
export interface EmailHealthCheck {
  status: 'healthy' | 'error' | 'not_configured'
  error: string | null
}
