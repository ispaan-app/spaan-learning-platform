import { NextRequest } from 'next/server'

interface AnalyticsEvent {
  id: string
  name: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  sessionId: string
  timestamp: number
  properties: Record<string, any>
  page: string
  userAgent: string
  ip?: string
}

interface AnalyticsMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  pageViews: number
  uniquePageViews: number
  averageSessionDuration: number
  bounceRate: number
  conversionRate: number
  topPages: Array<{ page: string; views: number }>
  topReferrers: Array<{ referrer: string; visits: number }>
  deviceTypes: Array<{ device: string; count: number }>
  browserTypes: Array<{ browser: string; count: number }>
  operatingSystems: Array<{ os: string; count: number }>
  countries: Array<{ country: string; count: number }>
  timeRanges: Array<{ range: string; users: number }>
}

interface BusinessMetrics {
  applicationsSubmitted: number
  applicationsApproved: number
  applicationsRejected: number
  applicationsPending: number
  learnersActive: number
  learnersCompleted: number
  learnersDroppedOut: number
  placementsActive: number
  placementsCompleted: number
  totalRevenue: number
  monthlyRevenue: number
  averagePlacementDuration: number
  learnerSatisfactionScore: number
  employerSatisfactionScore: number
  completionRate: number
  dropoutRate: number
  placementSuccessRate: number
}

class AnalyticsService {
  private static instance: AnalyticsService
  private events: AnalyticsEvent[] = []
  private sessions: Map<string, { startTime: number; events: number }> = new Map()
  private users: Set<string> = new Set()
  private activeUsers: Set<string> = new Set()
  private newUsers: Set<string> = new Set()

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  trackEvent(
    name: string,
    category: string,
    action: string,
    properties: Record<string, any> = {},
    request?: NextRequest
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      name,
      category,
      action,
      properties,
      sessionId: this.getOrCreateSession(),
      timestamp: Date.now(),
      page: request?.nextUrl.pathname || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
      ip: this.getClientIP(request)
    }

    this.events.push(event)
    this.updateUserMetrics(event)
    this.updateSessionMetrics(event)
  }

  trackPageView(page: string, request?: NextRequest): void {
    this.trackEvent('page_view', 'navigation', 'view', { page }, request)
  }

  trackUserAction(action: string, properties: Record<string, any> = {}, request?: NextRequest): void {
    this.trackEvent('user_action', 'user', action, properties, request)
  }

  trackBusinessEvent(event: string, properties: Record<string, any> = {}, request?: NextRequest): void {
    this.trackEvent('business_event', 'business', event, properties, request)
  }

  trackError(error: string, properties: Record<string, any> = {}, request?: NextRequest): void {
    this.trackEvent('error', 'system', 'error', { error, ...properties }, request)
  }

  trackConversion(conversion: string, value?: number, properties: Record<string, any> = {}, request?: NextRequest): void {
    this.trackEvent('conversion', 'business', conversion, { value, ...properties }, request)
  }

  getAnalyticsMetrics(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): AnalyticsMetrics {
    const now = Date.now()
    const timeRangeMs = this.getTimeRangeMs(timeRange)
    const cutoffTime = now - timeRangeMs

    const recentEvents = this.events.filter(event => event.timestamp >= cutoffTime)
    const recentSessions = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.startTime >= cutoffTime)

    const uniqueUsers = new Set(recentEvents.map(event => event.userId).filter(Boolean))
    const activeUsers = new Set(recentEvents.map(event => event.userId).filter(Boolean))

    const pageViews = recentEvents.filter(event => event.name === 'page_view').length
    const uniquePageViews = new Set(recentEvents
      .filter(event => event.name === 'page_view')
      .map(event => event.page)
    ).size

    const averageSessionDuration = this.calculateAverageSessionDuration(recentSessions)
    const bounceRate = this.calculateBounceRate(recentSessions)
    const conversionRate = this.calculateConversionRate(recentEvents)

    return {
      totalUsers: this.users.size,
      activeUsers: activeUsers.size,
      newUsers: this.newUsers.size,
      returningUsers: this.users.size - this.newUsers.size,
      pageViews,
      uniquePageViews,
      averageSessionDuration,
      bounceRate,
      conversionRate,
      topPages: this.getTopPages(recentEvents),
      topReferrers: this.getTopReferrers(recentEvents),
      deviceTypes: this.getDeviceTypes(recentEvents),
      browserTypes: this.getBrowserTypes(recentEvents),
      operatingSystems: this.getOperatingSystems(recentEvents),
      countries: this.getCountries(recentEvents),
      timeRanges: this.getTimeRanges(recentEvents)
    }
  }

  getBusinessMetrics(): BusinessMetrics {
    // In a real implementation, these would come from the database
    return {
      applicationsSubmitted: 0,
      applicationsApproved: 0,
      applicationsRejected: 0,
      applicationsPending: 0,
      learnersActive: 0,
      learnersCompleted: 0,
      learnersDroppedOut: 0,
      placementsActive: 0,
      placementsCompleted: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      averagePlacementDuration: 0,
      learnerSatisfactionScore: 0,
      employerSatisfactionScore: 0,
      completionRate: 0,
      dropoutRate: 0,
      placementSuccessRate: 0
    }
  }

  getEvents(filters?: {
    category?: string
    action?: string
    userId?: string
    timeRange?: 'hour' | 'day' | 'week' | 'month'
    limit?: number
  }): AnalyticsEvent[] {
    let filteredEvents = [...this.events]

    if (filters?.category) {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category)
    }

    if (filters?.action) {
      filteredEvents = filteredEvents.filter(event => event.action === filters.action)
    }

    if (filters?.userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === filters.userId)
    }

    if (filters?.timeRange) {
      const timeRangeMs = this.getTimeRangeMs(filters.timeRange)
      const cutoffTime = Date.now() - timeRangeMs
      filteredEvents = filteredEvents.filter(event => event.timestamp >= cutoffTime)
    }

    if (filters?.limit) {
      filteredEvents = filteredEvents.slice(-filters.limit)
    }

    return filteredEvents.sort((a, b) => b.timestamp - a.timestamp)
  }

  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV()
    }
    return JSON.stringify({
      events: this.events,
      metrics: this.getAnalyticsMetrics(),
      businessMetrics: this.getBusinessMetrics()
    }, null, 2)
  }

  clearData(): void {
    this.events = []
    this.sessions.clear()
    this.users.clear()
    this.activeUsers.clear()
    this.newUsers.clear()
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private getOrCreateSession(): string {
    const sessionId = sessionStorage.getItem('analytics_session_id') || this.generateId()
    sessionStorage.setItem('analytics_session_id', sessionId)
    
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { startTime: Date.now(), events: 0 })
    }
    
    return sessionId
  }

  private getClientIP(request?: NextRequest): string | undefined {
    if (!request) return undefined
    
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    return forwarded?.split(',')[0] || realIp || cfConnectingIp
  }

  private updateUserMetrics(event: AnalyticsEvent): void {
    if (event.userId) {
      this.users.add(event.userId)
      this.activeUsers.add(event.userId)
      
      // Check if this is a new user (first event)
      if (!this.newUsers.has(event.userId)) {
        this.newUsers.add(event.userId)
      }
    }
  }

  private updateSessionMetrics(event: AnalyticsEvent): void {
    const session = this.sessions.get(event.sessionId)
    if (session) {
      session.events++
    }
  }

  private getTimeRangeMs(timeRange: 'hour' | 'day' | 'week' | 'month'): number {
    const ranges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    }
    return ranges[timeRange]
  }

  private calculateAverageSessionDuration(sessions: Array<[string, { startTime: number; events: number }]>): number {
    if (sessions.length === 0) return 0
    
    const totalDuration = sessions.reduce((sum, [_, session]) => {
      return sum + (Date.now() - session.startTime)
    }, 0)
    
    return totalDuration / sessions.length
  }

  private calculateBounceRate(sessions: Array<[string, { startTime: number; events: number }]>): number {
    if (sessions.length === 0) return 0
    
    const bouncedSessions = sessions.filter(([_, session]) => session.events <= 1).length
    return (bouncedSessions / sessions.length) * 100
  }

  private calculateConversionRate(events: AnalyticsEvent[]): number {
    const totalEvents = events.length
    const conversionEvents = events.filter(event => event.name === 'conversion').length
    
    return totalEvents > 0 ? (conversionEvents / totalEvents) * 100 : 0
  }

  private getTopPages(events: AnalyticsEvent[]): Array<{ page: string; views: number }> {
    const pageViews = events.filter(event => event.name === 'page_view')
    const pageCounts = new Map<string, number>()
    
    pageViews.forEach(event => {
      const count = pageCounts.get(event.page) || 0
      pageCounts.set(event.page, count + 1)
    })
    
    return Array.from(pageCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }

  private getTopReferrers(events: AnalyticsEvent[]): Array<{ referrer: string; visits: number }> {
    const referrers = new Map<string, number>()
    
    events.forEach(event => {
      const referrer = event.properties.referrer || 'direct'
      const count = referrers.get(referrer) || 0
      referrers.set(referrer, count + 1)
    })
    
    return Array.from(referrers.entries())
      .map(([referrer, visits]) => ({ referrer, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)
  }

  private getDeviceTypes(events: AnalyticsEvent[]): Array<{ device: string; count: number }> {
    const devices = new Map<string, number>()
    
    events.forEach(event => {
      const device = this.getDeviceType(event.userAgent)
      const count = devices.get(device) || 0
      devices.set(device, count + 1)
    })
    
    return Array.from(devices.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
  }

  private getBrowserTypes(events: AnalyticsEvent[]): Array<{ browser: string; count: number }> {
    const browsers = new Map<string, number>()
    
    events.forEach(event => {
      const browser = this.getBrowserType(event.userAgent)
      const count = browsers.get(browser) || 0
      browsers.set(browser, count + 1)
    })
    
    return Array.from(browsers.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
  }

  private getOperatingSystems(events: AnalyticsEvent[]): Array<{ os: string; count: number }> {
    const os = new Map<string, number>()
    
    events.forEach(event => {
      const operatingSystem = this.getOperatingSystem(event.userAgent)
      const count = os.get(operatingSystem) || 0
      os.set(operatingSystem, count + 1)
    })
    
    return Array.from(os.entries())
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count)
  }

  private getCountries(events: AnalyticsEvent[]): Array<{ country: string; count: number }> {
    // In a real implementation, you would use IP geolocation
    return []
  }

  private getTimeRanges(events: AnalyticsEvent[]): Array<{ range: string; users: number }> {
    // In a real implementation, you would group events by time ranges
    return []
  }

  private getDeviceType(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile'
    } else if (/Tablet|iPad/.test(userAgent)) {
      return 'Tablet'
    } else {
      return 'Desktop'
    }
  }

  private getBrowserType(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }

  private getOperatingSystem(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Other'
  }

  private exportToCSV(): string {
    if (this.events.length === 0) return ''
    
    const headers = Object.keys(this.events[0]).join(',')
    const rows = this.events.map(event => 
      Object.values(event).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(',')
    )
    
    return [headers, ...rows].join('\n')
  }
}

// Analytics Hook for React components
export function useAnalytics() {
  const [analytics] = React.useState(() => AnalyticsService.getInstance())

  const trackEvent = React.useCallback((
    name: string,
    category: string,
    action: string,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackEvent(name, category, action, properties)
  }, [analytics])

  const trackPageView = React.useCallback((page: string) => {
    analytics.trackPageView(page)
  }, [analytics])

  const trackUserAction = React.useCallback((
    action: string,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackUserAction(action, properties)
  }, [analytics])

  const trackBusinessEvent = React.useCallback((
    event: string,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackBusinessEvent(event, properties)
  }, [analytics])

  const trackError = React.useCallback((
    error: string,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackError(error, properties)
  }, [analytics])

  const trackConversion = React.useCallback((
    conversion: string,
    value?: number,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackConversion(conversion, value, properties)
  }, [analytics])

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackBusinessEvent,
    trackError,
    trackConversion
  }
}

// Import React for hooks
import React from 'react'

export { AnalyticsService }
