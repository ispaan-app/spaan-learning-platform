
'use client';

import { SuperAdminWelcome } from './SuperAdminWelcome';
import { GlobalStats } from './GlobalStats';
import { LearnerDistributionChart } from './LearnerDistributionChart';
import { LearnerProvinceChart } from './LearnerProvinceChart';
import { AiReportGenerator } from './AiReportGenerator';
import { RecentActivity } from './RecentActivity';

import { Bell, TrendingUp, Users, Activity, Shield } from 'lucide-react';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { FirestoreErrorHandler } from '@/components/ui/dashboard-error-handler'
// ...existing code...


function SuperAdminDashboard() {
  // TODO: Replace with real data fetching and state logic
  const data = {
    globalStats: {
      totalUsers: 0,
      pendingApplications: 0,
      activePlacements: 0,
      totalAdmins: 0,
    },
    learnerDistribution: [],
    learnerProvince: [],
    learners: [],
    recentActivity: [],
  };
  const refreshing = false;
  const handleRefresh = () => {};
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRole, setBroadcastRole] = useState('all');
  const broadcastLoading = false;
  const handleBroadcast = () => {};

  return (
    <FirestoreErrorHandler>
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* Welcome Card */}
        <div className="animate-in slide-in-from-bottom duration-1000 delay-200 ease-out">
          <SuperAdminWelcome />
        </div>

        {/* Global Statistics */}
        <div className="animate-in slide-in-from-bottom duration-1000 delay-300 ease-out">
          <GlobalStats 
            stats={data.globalStats}
            onRefresh={handleRefresh}
            loading={refreshing}
          />
        </div>

        {/* Broadcast Announcement (Super Admin Only) */}
        <Card className="border-coral-200 bg-coral-50 animate-in slide-in-from-bottom duration-1000 delay-400 ease-out">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-coral" />
              <span>Broadcast Announcement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleBroadcast}>
              <div>
                <label className="block text-sm font-medium text-coral mb-1">Title</label>
                <input
                  className="w-full border border-coral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  placeholder="Announcement Title"
                  maxLength={80}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coral mb-1">Message</label>
                <textarea
                  className="w-full border border-coral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral"
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Write your announcement here..."
                  rows={3}
                  maxLength={500}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coral mb-1">Audience</label>
                <select
                  className="w-full border border-coral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral"
                  value={broadcastRole}
                  onChange={e => setBroadcastRole(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="learner">Learners</option>
                  <option value="applicant">Applicants</option>
                  <option value="admin">Admins</option>
                  <option value="super-admin">Super Admins</option>
                </select>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-coral hover:bg-coral/90"
                  disabled={broadcastLoading}
                >
                  {broadcastLoading ? 'Broadcasting...' : 'Send Announcement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-1000 delay-500 ease-out">
          {/* Left Column - Charts */}
          <div className="space-y-6">
            {/* Learner Distribution by Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Learner Distribution by Program</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LearnerDistributionChart data={data.learnerDistribution} />
              </CardContent>
            </Card>

            {/* Learner Distribution by Province */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Geographic Distribution of Learners</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LearnerProvinceChart data={data.learnerProvince} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Tools and Recent Activity */}
          <div className="space-y-6">
            {/* AI Report Generator */}
            <AiReportGenerator platformData={{
              totalUsers: data.globalStats.totalUsers || 0,
              totalLearners: data.learners.length || 0,
              totalApplicants: data.globalStats.pendingApplications || 0,
              activePlacements: data.globalStats.activePlacements || 0,
              learnerDistribution: data.learnerDistribution || [],
              learnerProvince: data.learnerProvince || [],
              recentActivity: data.recentActivity || []
            }} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Recent Platform Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={data.recentActivity} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strategic Management Actions */}
        <Card className="animate-in slide-in-from-bottom duration-1000 delay-700 ease-out">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <span>Strategic Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ... strategic management links ... */}
            </div>
          </CardContent>
        </Card>
      </div>
    </FirestoreErrorHandler>
  )
}

export default SuperAdminDashboard;
