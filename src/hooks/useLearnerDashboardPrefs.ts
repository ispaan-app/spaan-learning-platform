import { useEffect, useState } from 'react'

export type LearnerDashboardWidget =
  | 'welcome'
  | 'notifications'
  | 'wilProgress'
  | 'activity'
  | 'placement'
  | 'quickActions'
  | 'upcomingClasses'
  | 'aiMentor'

export interface WidgetPrefs {
  [key: string]: boolean
}

const DEFAULT_WIDGETS: WidgetPrefs = {
  welcome: true,
  notifications: true,
  wilProgress: true,
  activity: true,
  placement: true,
  quickActions: true,
  upcomingClasses: true,
  aiMentor: true,
}

export function useLearnerDashboardPrefs(userId?: string) {
  const [prefs, setPrefs] = useState<WidgetPrefs>(DEFAULT_WIDGETS)
  useEffect(() => {
    if (!userId) return
    const key = `learner_dashboard_prefs_${userId}`
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key)
      if (stored) setPrefs(JSON.parse(stored))
    }
  }, [userId])
  const setWidgetVisible = (widget: LearnerDashboardWidget, visible: boolean) => {
    setPrefs(prev => {
      const next = { ...prev, [widget]: visible }
      if (userId && typeof window !== 'undefined') {
        localStorage.setItem(`learner_dashboard_prefs_${userId}`, JSON.stringify(next))
      }
      return next
    })
  }
  return { prefs, setWidgetVisible }
}
