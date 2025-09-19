
'use client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useState } from 'react'
import { sendBroadcastMessage } from './actions'

export default function SuperAdminBroadcastPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      // In a real app, get super admin info from context/auth
      const result = await sendBroadcastMessage(
        title,
        message,
        'super-admin',
        'Super Admin'
      )
      if (result.success) {
        setSuccess(true)
        setTitle('')
        setMessage('')
      } else {
        setError('Failed to send broadcast')
      }
    } catch (err) {
      setError('Failed to send broadcast')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="max-w-xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-4">Broadcast Message</h1>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block font-medium">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Message</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Broadcast'}
          </button>
          {success && <div className="text-green-600">Broadcast sent successfully!</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>
    </AdminLayout>
  )
}
