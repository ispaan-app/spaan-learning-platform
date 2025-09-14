// Simple support chat flow without Genkit for now
export const supportChatFlow = async (input: {
  message: string
  conversationHistory: Array<{
    role: 'user' | 'model'
    content: string
  }>
}): Promise<string> => {
  const { message, conversationHistory } = input

  // Simple keyword-based responses for now
  const lowerMessage = message.toLowerCase()

  // Check for common questions about check-in
  if (lowerMessage.includes('check in') || lowerMessage.includes('check-in') || lowerMessage.includes('attendance')) {
    return `To check in to your WIL placement or training session:

1. **Go to the Check-In page** from your learner dashboard
2. **Select your location** - choose between work placement or training session
3. **Take a selfie** for identity verification
4. **Scan the QR code** at your location
5. **Enter your 6-digit PIN** for security verification

The system uses multi-factor verification to ensure accurate attendance tracking. If you're having trouble, make sure you have camera permissions enabled and are at the correct location.`
  }

  // Check for leave-related questions
  if (lowerMessage.includes('leave') || lowerMessage.includes('vacation') || lowerMessage.includes('time off')) {
    return `To request leave:

1. **Navigate to Leave Management** from your dashboard
2. **Click "Request Leave"** button
3. **Fill out the form** with:
   - Leave type (sick, personal, emergency, other)
   - Start and end dates
   - Reason for leave
4. **Submit your request**

Your request will be reviewed by administrators. You can track the status in your leave management section.`
  }

  // Check for document questions
  if (lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return `To manage your documents:

1. **Go to Documents section** in your dashboard
2. **Upload required files** like:
   - ID documents
   - Academic certificates
   - WIL placement agreements
   - Medical certificates (if applicable)
3. **Check document status** - approved, pending, or rejected
4. **Re-upload if needed** if documents are rejected

Make sure documents are clear, readable, and in supported formats (PDF, JPG, PNG).`
  }

  // Check for application questions
  if (lowerMessage.includes('application') || lowerMessage.includes('apply') || lowerMessage.includes('status')) {
    return `To track your application:

1. **Check your applicant dashboard** for current status
2. **View application progress** in the progress bar
3. **Upload required documents** as requested
4. **Complete any pending steps**

Application statuses include: Submitted, Under Review, Approved, Rejected, or Pending Documents.`
  }

  // Check for WIL questions
  if (lowerMessage.includes('wil') || lowerMessage.includes('work') || lowerMessage.includes('placement')) {
    return `Work-Integrated Learning (WIL) features:

1. **WIL Dashboard** - Track your work hours and progress
2. **Secure Check-In** - Log attendance at your placement
3. **Progress Tracking** - Monitor hours completed vs. required
4. **Placement Management** - View current placement details
5. **Document Management** - Upload WIL-related documents

Your WIL progress is tracked automatically when you check in and out of your placement.`
  }

  // Check for general help
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return `I'm here to help with the iSpaan platform! Here are common topics:

**For Learners:**
- WIL attendance tracking and check-in
- Leave request management
- Document uploads
- Progress monitoring

**For Applicants:**
- Application status tracking
- Document requirements
- Application process guidance

**General Features:**
- AI Career Mentor for guidance
- Role-based dashboards
- Secure multi-factor verification
- Real-time progress tracking

What specific feature would you like help with?`
  }

  // Default response
  return `I understand you're asking about "${message}". 

The iSpaan platform is a comprehensive Work-Integrated Learning (WIL) monitoring and classroom attendance system. 

For specific help with:
- **Check-in/Attendance**: Use the Check-In page with multi-factor verification
- **Leave Requests**: Go to Leave Management section
- **Documents**: Access the Documents area in your dashboard
- **WIL Progress**: Check your learner dashboard for progress tracking

If you need more specific help, please describe what you're trying to do and I'll provide detailed guidance!`
}
