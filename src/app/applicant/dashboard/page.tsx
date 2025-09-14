// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { useAuth } from '@/hooks/useAuth'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  Award
} from 'lucide-react'

export default function ApplicantDashboardPage() {
  const { user, userData } = useAuth()
  
  // Mock data for applicant dashboard
  const applicantStats = {
    applicationProgress: 75,
    documentsUploaded: 3,
    totalDocuments: 4,
    daysSinceApplication: 5,
    nextStep: 'Interview Scheduled'
  }

  const recentActivity = [
    {
      id: '1',
      action: 'Document uploaded: Academic Transcript',
      timestamp: '2 hours ago',
      type: 'document'
    },
    {
      id: '2',
      action: 'Application status updated',
      timestamp: 'Yesterday',
      type: 'status'
    },
    {
      id: '3',
      action: 'Interview scheduled for Jan 20',
      timestamp: '2 days ago',
      type: 'interview'
    }
  ]

  const documents = [
    { name: 'CV', status: 'uploaded', required: true },
    { name: 'ID Document', status: 'uploaded', required: true },
    { name: 'Academic Transcript', status: 'uploaded', required: true },
    { name: 'Cover Letter', status: 'pending', required: false }
  ]

  const timeline = [
    { step: 'Application Submitted', date: '2024-01-10', status: 'completed' },
    { step: 'Documents Reviewed', date: '2024-01-12', status: 'completed' },
    { step: 'Interview Scheduled', date: '2024-01-20', status: 'upcoming' },
    { step: 'Final Decision', date: '2024-01-25', status: 'pending' }
  ]

  return (
    <AdminLayout userRole="applicant">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Welcome Card */}
        <WelcomeCard 
          userName={user?.displayName || userData?.firstName || "Applicant"} 
          userRole="applicant" 
          className="mb-6 animate-in slide-in-from-bottom duration-700 delay-300"
        />

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-700 delay-300">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Application Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{applicantStats.applicationProgress}%</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documents Uploaded</p>
                  <p className="text-2xl font-bold text-green-600">{applicantStats.documentsUploaded}/{applicantStats.totalDocuments}</p>
                  <p className="text-xs text-gray-500">Required docs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Since Application</p>
                  <p className="text-2xl font-bold text-purple-600">{applicantStats.daysSinceApplication}</p>
                  <p className="text-xs text-gray-500">Days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Step</p>
                  <p className="text-sm font-bold text-orange-600">Interview</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700 delay-500">
          {/* Left Column - Application Progress and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Progress */}
            <Card className="animate-in slide-in-from-left duration-700 delay-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Application Progress</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold">{applicantStats.applicationProgress}%</span>
                  </div>
                  <Progress value={applicantStats.applicationProgress} className="h-3" />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Next Step: {applicantStats.nextStep}</h3>
                  <p className="text-sm text-blue-700">Your interview is scheduled for January 20, 2024 at 2:00 PM</p>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="animate-in slide-in-from-left duration-700 delay-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Documents and Quick Actions */}
          <div className="space-y-6">
            {/* Document Status */}
            <Card className="animate-in slide-in-from-right duration-700 delay-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Document Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {doc.status === 'uploaded' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.required ? 'Required' : 'Optional'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        doc.status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-in slide-in-from-right duration-700 delay-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  View Application
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Timeline */}
        <Card className="animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Application Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-100 text-green-600' :
                    item.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.step}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}