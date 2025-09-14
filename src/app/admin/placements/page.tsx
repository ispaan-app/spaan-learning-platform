'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Building2, 
  MapPin, 
  Users, 
  Eye, 
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit,
  Trash2,
  Target,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Bot,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  MapPinIcon,
  UserCheck,
  UserX,
  Download
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPlacementsAction, Placement } from './actions'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export default function PlacementsPage() {
  const router = useRouter()
  const [placements, setPlacements] = useState<Placement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'full'>('all')

  const loadPlacements = async () => {
    try {
      setIsLoading(true)
      const data = await getPlacementsAction()
      setPlacements(data)
    } catch (error) {
      console.error('Error loading placements:', error)
      toast.error('Failed to load placements')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlacements()
  }, [])

  const filteredPlacements = placements.filter(placement => {
    const matchesSearch = placement.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         placement.suburb.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         placement.province.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || placement.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'full': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (assigned: number, capacity: number) => {
    return capacity > 0 ? (assigned / capacity) * 100 : 0
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Work Placements</h1>
            <p className="text-gray-600">Manage WIL placement opportunities and assignments</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadPlacements}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => router.push('/admin/placements/create')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Placement</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Placements</p>
                  <p className="text-2xl font-bold text-blue-600">{placements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Placements</p>
                  <p className="text-2xl font-bold text-green-600">
                    {placements.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {placements.reduce((sum, p) => sum + p.capacity, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Assigned Learners</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {placements.reduce((sum, p) => sum + p.assignedLearners, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company, suburb, or province..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placements Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Placements ({filteredPlacements.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPlacements.length > 0 ? (
              <div className="space-y-4">
                {filteredPlacements.map((placement) => (
                  <div
                    key={placement.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              <button
                                onClick={() => router.push(`/admin/placements/${placement.id}`)}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {placement.companyName}
                              </button>
                            </h3>
                            <p className="text-sm text-gray-600">{placement.suburb}, {placement.province}</p>
                          </div>
                          <Badge className={getStatusColor(placement.status)}>
                            {placement.status}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{placement.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{placement.assignedLearners} / {placement.capacity} learners</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Capacity Progress</span>
                            <span className="font-medium">
                              {placement.assignedLearners} / {placement.capacity}
                            </span>
                          </div>
                          <Progress 
                            value={getProgressPercentage(placement.assignedLearners, placement.capacity)} 
                            className="h-2" 
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => router.push(`/admin/placements/${placement.id}`)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No placements found</p>
                <p className="text-sm">Create your first placement to get started</p>
                <Button
                  onClick={() => router.push('/admin/placements/create')}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Placement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

