
'use client'
import { RecentPlatformActivity } from '@/components/admin/RecentPlatformActivity'
import { AdminNotificationsPanel } from '@/components/notifications/AdminNotificationsPanel'
import { useRealtimeAdminActivity } from '@/hooks/useRealtimeAdminActivity'
import { useRealtimeAdminNotifications } from '@/hooks/useRealtimeAdminNotifications'
import { useAdminList } from '@/hooks/useAdminList'

import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { notificationActions } from '@/lib/notificationActions'
import { AiChatbot } from '@/components/ai-chatbot'
import { FirestoreErrorHandler } from '@/components/ui/dashboard-error-handler'
import { AdminDashboardErrorHandler } from '@/components/ui/admin-dashboard-error-handler'
import { StatsCards } from '@/components/admin/StatsCards'
import { UrgentAlertsPanel, UrgentAlert } from '@/components/admin/UrgentAlertsPanel'
import { RecentApplicants } from '@/components/admin/RecentApplicants'
import { BulkApplicantActions } from '@/components/admin/BulkApplicantActions'
import { PlacementStatusChart } from '@/components/admin/PlacementStatusChart'
import { OverviewChart } from '@/components/admin/OverviewChart'
import { LearnerProgramChart } from '@/components/admin/LearnerProgramChart'
import { LearnerActivityFeed } from '@/components/admin/LearnerActivityFeed'
import { DropoutRiskAnalyzer } from '@/components/admin/DropoutRiskAnalyzer'
// Test panel removed for production
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedAdminDashboardContent } from './enhanced-page'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { StatsSkeleton, ChartSkeleton, ListSkeleton } from '@/components/ui/skeleton'
import React, { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface DashboardStats {
  pendingApplicants: number
  totalLearners: number
  activePlacements: number
  assignedLearners: number
}


interface RecentApplicant {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  applicationDate: string
  status: string
}

interface ApplicationStatusData {
  pending: number
  approved: number
  rejected: number
}

interface LearnerProgramData {
  program: string
  count: number
}

interface PlacementStatusData {
  status: string
  count: number
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Parallel queries for better performance
    const [
      pendingApplicantsSnapshot,
      totalLearnersSnapshot,
      activePlacementsSnapshot,
      assignedLearnersSnapshot
    ] = await Promise.all([
      getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        where('status', '==', 'pending-review')
      )),
      getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'learner')
      )),
      getDocs(query(
        collection(db, 'placements'),
        where('status', '==', 'active')
      )),
      getDocs(query(
        collection(db, 'placements'),
        where('assignedLearnerId', '!=', null)
      ))
    ])

    return {
      pendingApplicants: pendingApplicantsSnapshot.size,
      totalLearners: totalLearnersSnapshot.size,
      activePlacements: activePlacementsSnapshot.size,
      assignedLearners: assignedLearnersSnapshot.size
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      pendingApplicants: 0,
      totalLearners: 0,
      activePlacements: 0,
      assignedLearners: 0
    }
  }
}


async function getRecentApplicants(): Promise<RecentApplicant[]> {
  try {
    const applicantsSnapshot = await getDocs(query(
      collection(db, 'users'),
      where('role', '==', 'applicant'),
      orderBy('createdAt', 'desc'),
      limit(4)
    ))

    return applicantsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as RecentApplicant[]
  } catch (error) {
    console.error('Error fetching recent applicants:', error)
    return []
  }
}

async function getApplicationStatusData(): Promise<ApplicationStatusData> {
  try {
    const [pendingSnapshot, approvedSnapshot, rejectedSnapshot] = await Promise.all([
      getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        where('status', '==', 'pending-review')
      )),
      getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        where('status', '==', 'approved')
      )),
      getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        where('status', '==', 'rejected')
      ))
    ])

    return {
      pending: pendingSnapshot.size,
      approved: approvedSnapshot.size,
      rejected: rejectedSnapshot.size
    }
  } catch (error) {
    console.error('Error fetching application status data:', error)
    return { pending: 0, approved: 0, rejected: 0 }
  }
}

async function getLearnerProgramData(): Promise<LearnerProgramData[]> {
  try {
    const learnersSnapshot = await getDocs(query(
      collection(db, 'users'),
      where('role', '==', 'learner')
    ))

    const programCounts: { [key: string]: number } = {}
    
    learnersSnapshot.docs.forEach((doc: any) => {
      const program = doc.data().program
      if (program) {
        programCounts[program] = (programCounts[program] || 0) + 1
      }
    })

    return Object.entries(programCounts).map(([program, count]) => ({
      program: program.charAt(0).toUpperCase() + program.slice(1).replace('-', ' '),
      count
    }))
  } catch (error) {
    console.error('Error fetching learner program data:', error)
    return []
  }
}

async function getPlacementStatusData(): Promise<PlacementStatusData[]> {
  try {
    const placementsSnapshot = await getDocs(collection(db, 'placements'))

    const statusCounts: { [key: string]: number } = {}
    
    placementsSnapshot.docs.forEach((doc: any) => {
      const status = doc.data().status || 'unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }))
  } catch (error) {
    console.error('Error fetching placement status data:', error)
    return []
  }
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout userRole="admin">
      <FirestoreErrorHandler>
        <EnhancedAdminDashboardContent />
      </FirestoreErrorHandler>
    </AdminLayout>
  )
}


function AdminDashboardContent() {
  const recentActivity = useRealtimeAdminActivity(10);
  const adminNotifications = useRealtimeAdminNotifications(10);
  const [searchRecent, setSearchRecent] = React.useState('');
  const { user, userData } = useAuth();
  const admins = useAdminList();
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats>({
    pendingApplicants: 0,
    totalLearners: 0,
    activePlacements: 0,
    assignedLearners: 0
  });
  const [recentApplicants, setRecentApplicants] = React.useState<RecentApplicant[]>([]);
  const [applicationStatusData, setApplicationStatusData] = React.useState<ApplicationStatusData>({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [learnerProgramData, setLearnerProgramData] = React.useState<LearnerProgramData[]>([]);
  const [placementStatusData, setPlacementStatusData] = React.useState<PlacementStatusData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [urgentAlerts, setUrgentAlerts] = React.useState<UrgentAlert[]>([]);

  React.useEffect(() => {
    setError(null);
    setLoading(true);

    // Real-time stats
    const unsubApplicants = collection(db, 'users');
    const unsubPlacements = collection(db, 'placements');

    // Pending Applicants
    const qPending = query(unsubApplicants, where('role', '==', 'applicant'), where('status', '==', 'pending-review'));
    const unsubPending = onSnapshot(qPending, (snapshot) => {
      setDashboardStats((prev) => ({ ...prev, pendingApplicants: snapshot.size }));
      setApplicationStatusData((prev) => ({ ...prev, pending: snapshot.size }));
    }, (err) => setError(err));

    // Total Learners
    const qLearners = query(unsubApplicants, where('role', '==', 'learner'));
    const unsubLearners = onSnapshot(qLearners, (snapshot) => {
      setDashboardStats((prev) => ({ ...prev, totalLearners: snapshot.size }));
      // Learner Program Data
      const programCounts: { [key: string]: number } = {};
      snapshot.docs.forEach((doc: any) => {
        const program = doc.data().program;
        if (program) {
          programCounts[program] = (programCounts[program] || 0) + 1;
        }
      });
      setLearnerProgramData(Object.entries(programCounts).map(([program, count]) => ({
        program: program.charAt(0).toUpperCase() + program.slice(1).replace('-', ' '),
        count
      })));
    }, (err) => setError(err));

    // Recent Applicants
    const qRecent = query(unsubApplicants, where('role', '==', 'applicant'), orderBy('createdAt', 'desc'), limit(4));
    const unsubRecent = onSnapshot(qRecent, (snapshot) => {
      setRecentApplicants(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    }, (err) => setError(err));

    // Application Status: Approved
    const qApproved = query(unsubApplicants, where('role', '==', 'applicant'), where('status', '==', 'approved'));
    const unsubApproved = onSnapshot(qApproved, (snapshot) => {
      setApplicationStatusData((prev) => ({ ...prev, approved: snapshot.size }));
    }, (err) => setError(err));

    // Application Status: Rejected
    const qRejected = query(unsubApplicants, where('role', '==', 'applicant'), where('status', '==', 'rejected'));
    const unsubRejected = onSnapshot(qRejected, (snapshot) => {
      setApplicationStatusData((prev) => ({ ...prev, rejected: snapshot.size }));
    }, (err) => setError(err));

    // Placements: Active
    const qActivePlacements = query(unsubPlacements, where('status', '==', 'active'));
    const unsubActivePlacements = onSnapshot(qActivePlacements, (snapshot) => {
      setDashboardStats((prev) => ({ ...prev, activePlacements: snapshot.size }));
    }, (err) => setError(err));

    // Placements: Assigned
    const qAssignedPlacements = query(unsubPlacements, where('assignedLearnerId', '!=', null));
    const unsubAssignedPlacements = onSnapshot(qAssignedPlacements, (snapshot) => {
      setDashboardStats((prev) => ({ ...prev, assignedLearners: snapshot.size }));
    }, (err) => setError(err));

    // Placement Status Data
    const unsubPlacementStatus = onSnapshot(unsubPlacements, (snapshot) => {
      const statusCounts: { [key: string]: number } = {};
      snapshot.docs.forEach((doc: any) => {
        const status = doc.data().status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      setPlacementStatusData(Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count
      })));
    }, (err) => setError(err));


    // Urgent Alerts logic
    setUrgentAlerts(() => {
      const alerts: UrgentAlert[] = [];
      // Example: Too many pending applicants
      if (dashboardStats.pendingApplicants > 5) {
        alerts.push({
          type: 'applicant',
          message: `There are ${dashboardStats.pendingApplicants} applicants waiting for review!`,
          severity: 'warning',
        });
      }
      // Example: Placements at capacity
      if (dashboardStats.activePlacements > 0 && dashboardStats.activePlacements === dashboardStats.assignedLearners) {
        alerts.push({
          type: 'placement',
          message: 'All active placements are at full capacity!',
          severity: 'error',
        });
      }
      // Example: Learners at risk (placeholder, real logic can use AI/DropoutRiskAnalyzer)
      // alerts.push({ type: 'learner', message: 'Some learners are at risk of dropping out.', severity: 'info' });
      return alerts;
    });
    setLoading(false);

    return () => {
      unsubPending();
      unsubLearners();
      unsubRecent();
      unsubApproved();
      unsubRejected();
      unsubActivePlacements();
      unsubAssignedPlacements();
      unsubPlacementStatus();
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The listeners will auto-update, so just reset error/loading
    setTimeout(() => setLoading(false), 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <AdminLayout userRole="admin">
        <div className="p-6">
          <AdminDashboardErrorHandler 
            error={error}
            onRetry={handleRetry}
            userRole="admin"
            isAuthenticated={true}
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
  {/* Admin-to-Admin Messaging Inbox removed as requested */}
      {/* Admin Notifications Panel */}
      <AdminNotificationsPanel notifications={adminNotifications} />
      {/* Urgent Alerts Panel */}
      <UrgentAlertsPanel alerts={urgentAlerts} />

      {/* Welcome Card */}
      <WelcomeCard 
        userName={user?.displayName || userData?.firstName || "Admin User"} 
        userRole="admin" 
        className="mb-6 animate-in slide-in-from-bottom duration-1000 delay-200 ease-out"
      />


      {/* Quick Access: Audit Logs */}
      <div className="flex justify-end mb-2 animate-in fade-in duration-700">
        <a
          href="/admin/audit-logs"
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors font-semibold text-sm gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          View Audit Logs
        </a>
      </div>

      {/* Key Performance Indicators */}
      <Suspense fallback={<StatsSkeleton />}>
        <div className="animate-in slide-in-from-bottom duration-1000 delay-300 ease-out">
          <StatsCards stats={dashboardStats} />
        </div>
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-1000 delay-400 ease-out">
        {/* Left Column - Recent Activity and Applicants */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Admin Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Recent Admin Activity</span>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentPlatformActivity activities={recentActivity} />
            </CardContent>
          </Card>
          {/* Recent Applicants with Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Recent Applicants</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <BulkApplicantActions
                  onApproveAll={() => alert('Approve All Applicants (TODO: Implement logic)')}
                  onSendReminders={() => alert('Send Reminders to Applicants (TODO: Implement logic)')}
                />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  className="border rounded px-2 py-1 text-sm w-full sm:w-64"
                  value={searchRecent}
                  onChange={e => setSearchRecent(e.target.value)}
                />
              </div>
              <Suspense fallback={<ListSkeleton items={4} />}> 
                <div className="divide-y">
                  {recentApplicants.filter(a =>
                    a.firstName?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.lastName?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.email?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.program?.toLowerCase().includes(searchRecent.toLowerCase())
                  ).map(applicant => (
                    <div key={applicant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2">
                      <div>
                        <div className="font-semibold text-gray-900">{applicant.firstName || 'Unknown'} {applicant.lastName || ''}</div>
                        <div className="text-xs text-gray-600">{applicant.email || 'No email'}</div>
                        <div className="text-xs text-gray-500">{applicant.program || 'Unknown program'}</div>
                        <div className="text-xs text-gray-400">
                          {applicant.applicationDate && applicant.applicationDate !== 'Invalid Date'
                            ? new Date(applicant.applicationDate).toLocaleDateString()
                            : 'No date'}
                        </div>
                        <div className="text-xs">
                          <span className={`inline-block px-2 py-0.5 rounded ${applicant.status === 'pending-review' ? 'bg-yellow-100 text-yellow-800' : applicant.status === 'approved' ? 'bg-green-100 text-green-800' : applicant.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{applicant.status ? applicant.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <a
                          href={`/admin/applicants/${applicant.id}`}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium shadow"
                        >
                          Review
                        </a>
                        {applicant.status === 'pending-review' && (
                          <div className="flex gap-1">
                            <button
                              className="px-2 py-0.5 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'users', applicant.id), { status: 'approved' });
                                } catch (err) {
                                  alert('Failed to approve applicant.');
                                }
                              }}
                            >Approve</button>
                            <button
                              className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'users', applicant.id), { status: 'rejected' });
                                } catch (err) {
                                  alert('Failed to reject applicant.');
                                }
                              }}
                            >Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {recentApplicants.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No recent applicants found.</div>
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  <a href="/admin/applicants" className="text-blue-600 hover:underline text-xs font-medium">View All Applicants &rarr;</a>
                </div>
              </Suspense>
            </CardContent>
          </Card>

          {/* Learner Activity Feed */}
          <LearnerActivityFeed />
        </div>

        {/* Right Column - Charts and AI Tools */}
        <div className="space-y-6">
          {/* AI Dropout Risk Analyzer */}
          <DropoutRiskAnalyzer learners={[]} />

          {/* Application Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
              <OverviewChart data={applicationStatusData} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Learner Program Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Learner Program Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
              <LearnerProgramChart data={learnerProgramData} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Placement Status */}
          <Card>
            <CardHeader>
              <CardTitle>Placement Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
              <PlacementStatusChart data={placementStatusData} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Core Admin Functions */}
      <Card className="animate-in slide-in-from-bottom duration-1000 delay-800 ease-out">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Core Admin Functions</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                href: "/admin/applicants",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "Review Applications",
                description: "Review new applications, approve/reject documents, and promote applicants to learners",
                color: "blue",
                delay: 0,
                features: ["Document Review", "Application Approval", "Role Promotion"]
              },
              {
                href: "/admin/learners",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
                title: "Manage Learners",
                description: "View learner profiles, track progress, and use AI dropout risk analysis",
                color: "green",
                delay: 100,
                features: ["Profile Management", "Progress Tracking", "AI Risk Analysis"]
              },
              {
                href: "/admin/placements",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                title: "Manage Placements",
                description: "Create WIL opportunities, use AI geocoding, and match candidates",
                color: "purple",
                delay: 200,
                features: ["Create Placements", "AI Geocoding", "Candidate Matching"]
              },
              {
                href: "/admin/class-sessions",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "Class Sessions",
                description: "Schedule in-person sessions, generate QR codes, and manage attendance",
                color: "indigo",
                delay: 300,
                features: ["Session Scheduling", "QR Code Generation", "Attendance Tracking"]
              },
              {
                href: "/admin/announcements",
                icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
                title: "Announcements",
                description: "Create announcements with AI assistance and send to all learners",
                color: "orange",
                delay: 400,
                features: ["AI Writing Assistant", "Bulk Notifications", "Push Notifications"]
              },
              {
                href: "/admin/profile",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                title: "Profile Management",
                description: "Manage personal information, password, and account settings",
                color: "gray",
                delay: 500,
                features: ["Personal Info", "Password Management", "Account Settings"]
              }
            ].map((action, index) => (
              <a
                key={action.href}
                href={action.href}
                className={`group p-6 border border-gray-200 rounded-lg hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-${action.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200 shadow-md`}>
                    <svg className={`w-8 h-8 text-${action.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 mb-2 text-lg">{action.title}</h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 mb-4 leading-relaxed">{action.description}</p>
                  
                  {/* Features List */}
                  <div className="space-y-1">
                    {action.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex}
                        className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200"
                      >
                        • {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Tools */}
      <Card className="animate-in slide-in-from-bottom duration-1000 delay-900 ease-out">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Additional Tools</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "/admin/analytics",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z",
                title: "Analytics",
                description: "View detailed analytics and insights",
                color: "blue",
                delay: 0
              },
              {
                href: "/admin/reports",
                icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Reports",
                description: "Generate and export reports",
                color: "green",
                delay: 100
              },
              {
                href: "/admin/settings",
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                title: "Settings",
                description: "Platform configuration and settings",
                color: "gray",
                delay: 200
              },
              {
                href: "/admin/audit-logs",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Audit Logs",
                description: "View system activity and logs",
                color: "orange",
                delay: 300
              }
            ].map((action, index) => (
              <a
                key={action.href}
                href={action.href}
                className={`group p-4 border border-gray-200 rounded-lg hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 bg-${action.color}-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200`}>
                    <svg className={`w-6 h-6 text-${action.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-800">{action.title}</h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700">{action.description}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
