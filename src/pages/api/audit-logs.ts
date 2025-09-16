import type { NextApiRequest, NextApiResponse } from 'next'
import { auditLogger } from '@/lib/auditLogger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // /api/audit-logs?userId=...&action=...&category=...&severity=...&startDate=...&endDate=...&limit=...
    const {
      userId,
      action,
      category,
      severity,
      startDate,
      endDate,
      limit,
      stats
    } = req.query

    try {
      if (stats === 'true') {
        // Return audit stats
        const days = req.query.days ? parseInt(req.query.days as string, 10) : 30
        const result = await auditLogger.getStats(days)
        return res.status(200).json(result)
      }
      // Return audit logs
      const filters: any = {}
      if (userId) filters.userId = userId
      if (action) filters.action = action
      if (category) filters.category = category
      if (severity) filters.severity = severity
      if (startDate) filters.startDate = new Date(startDate as string)
      if (endDate) filters.endDate = new Date(endDate as string)
      if (limit) filters.limit = parseInt(limit as string, 10)
      const logs = await auditLogger.getLogs(filters)
      return res.status(200).json(logs)
    } catch (error) {
      console.error('API error fetching audit logs:', error)
      return res.status(500).json({ error: 'Failed to fetch audit logs' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
