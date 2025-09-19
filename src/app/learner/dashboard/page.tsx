'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { Settings } from 'lucide-react'
import { useLearnerDashboardPrefs } from '@/hooks/useLearnerDashboardPrefs'
import { LearnerNotificationsPanel } from '@/components/learner/LearnerNotificationsPanel'
import { useNotifications } from '@/hooks/useNotifications'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  BookOpen, 
  Award, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  FileText, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle,
  User,
  RefreshCw,
  Bell,
  ExternalLink,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { LearnerService, LearnerStats, RecentActivity, UpcomingClass, PlacementInfo } from '@/lib/services/learner-service'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { MonthlyHoursProgress } from '@/components/shared/monthly-hours-progress'
import { ReportIssueModal } from '@/components/learner/report-issue-modal'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { getLearnerMonthlyHours, reportStipendIssueAction } from '@/app/learner/actions'

export default function LearnerDashboard() {
  const { user, userRole } = useAuth();
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const { prefs, setWidgetVisible } = useLearnerDashboardPrefs(user?.uid);
  const [showPrefs, setShowPrefs] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [learnerStats, setLearnerStats] = useState<LearnerStats>({
    workHours: 0,
    targetHours: 160,
    completedCourses: 0,
    certificates: 0,
    upcomingClasses: 0,
    leaveRequests: 0,
    pendingDocuments: 0,
    placementStatus: 'inactive'
  });
  // Real-time Firestore listeners for stats, activity, and classes
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const unsubRefs = useRef<any[]>([]);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    unsubRefs.current.forEach(unsub => unsub && unsub());
    unsubRefs.current = [];

    // Attendance (work hours, activity)
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('userId', '==', user.uid),
      where('checkOutTime', '!=', null),
      orderBy('checkInTime', 'desc'),
      limit(10)
    );
    const unsubAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      let totalWorkHours = 0;
      const activities: RecentActivity[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.checkInTime && data.checkOutTime) {
          const checkIn = data.checkInTime.toDate();
          const checkOut = data.checkOutTime.toDate();
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          totalWorkHours += hours;
        }
        const checkInTime = data.checkInTime?.toDate?.() || new Date();
        const isCheckedOut = data.checkOutTime !== null;
        activities.push({
          id: docSnap.id,
          type: isCheckedOut ? 'checkout' : 'checkin',
          title: isCheckedOut ? 'Checked out from work' : 'Checked in to work',
          description: isCheckedOut 
            ? `Completed work session at ${data.placementId ? 'work placement' : 'training session'}`
            : `Started work session at ${data.placementId ? 'work placement' : 'training session'}`,
          timestamp: checkInTime,
          status: 'success'
        });
      });
      setLearnerStats(prev => ({ ...prev, workHours: Math.round(totalWorkHours * 10) / 10 }));
      setRecentActivity(prev => {
        return [
          ...activities.map(a => ({
            ...a,
            type: a.type as RecentActivity['type'],
            status: a.status as RecentActivity['status'],
          } as RecentActivity)),
          ...prev.filter(a => a.type !== 'checkin' && a.type !== 'checkout')
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
      });
    }, (err) => setError('Failed to load attendance data'));
    unsubRefs.current.push(unsubAttendance);

    // Completed Courses
    const coursesQuery = query(
      collection(db, 'learnerCourses'),
      where('userId', '==', user.uid),
      where('status', '==', 'completed')
    );
    const unsubCourses = onSnapshot(coursesQuery, (snapshot) => {
      setLearnerStats(prev => ({ ...prev, completedCourses: snapshot.size }));
    }, (err) => setError('Failed to load courses data'));
    unsubRefs.current.push(unsubCourses);

    // Certificates
    const certsQuery = query(
      collection(db, 'certificates'),
      where('userId', '==', user.uid),
      where('status', '==', 'issued')
    );
    const unsubCerts = onSnapshot(certsQuery, (snapshot) => {
      setLearnerStats(prev => ({ ...prev, certificates: snapshot.size }));
    }, (err) => setError('Failed to load certificates data'));
    unsubRefs.current.push(unsubCerts);

    // Upcoming Classes
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const classesQuery = query(
      collection(db, 'classSessions'),
      where('date', '>=', today),
      where('date', '<=', nextMonth),
      where('participants', 'array-contains', user.uid),
      orderBy('date', 'asc')
    );
    const unsubClasses = onSnapshot(classesQuery, (snapshot) => {
      setUpcomingClasses(snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const classDate = data.date.toDate();
        return {
          id: docSnap.id,
          title: data.title,
          date: classDate.toLocaleDateString(),
          time: classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: data.location,
          instructor: data.instructor,
          type: data.type || 'training',
          status: data.status || 'scheduled'
        };
      }));
      setLearnerStats(prev => ({ ...prev, upcomingClasses: snapshot.size }));
    }, (err) => setError('Failed to load classes data'));
    unsubRefs.current.push(unsubClasses);

    setIsLoading(false);
    return () => {
      unsubRefs.current.forEach(unsub => unsub && unsub());
      unsubRefs.current = [];
    };
  }, [user]);
  // ...existing code...
  if (isLoading) {
    return (
      <AdminLayout userRole="learner">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole="learner">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Work Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{learnerStats.workHours}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{learnerStats.completedCourses}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{learnerStats.upcomingClasses}</span>
          </CardContent>
        </Card>
      </div>
      {/* More dashboard widgets and features will be restored next */}
    </AdminLayout>
  );
}