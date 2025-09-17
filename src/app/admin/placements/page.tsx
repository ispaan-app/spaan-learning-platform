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
    const companyName = placement.companyName ? placement.companyName.toLowerCase() : '';
    const suburb = placement.suburb ? placement.suburb.toLowerCase() : '';
    const province = placement.province ? placement.province.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = companyName.includes(search) ||
                         suburb.includes(search) ||
                         province.includes(search);
    const matchesStatus = statusFilter === 'all' || placement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#FF6E40' }}></div>
            <p className="text-lg font-medium" style={{ color: '#1E3D59' }}>Loading placements...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold" style={{ color: '#1E3D59' }}>
                Work Placements
              </h1>
              <p className="text-lg" style={{ color: '#1E3D59', opacity: 0.7 }}>
                Manage WIL placement opportunities and assignments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={loadPlacements}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
                style={{ 
                  borderColor: 'rgba(30, 61, 89, 0.2)',
                  color: '#1E3D59'
                }}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={() => router.push('/admin/placements/create')}
                className="flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <Plus className="h-4 w-4" />
                <span>Create Placement</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="relative rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Total Placements</p>
                  <p className="text-3xl font-bold" style={{ color: '#1E3D59' }}>{placements.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Active Placements</p>
                  <p className="text-3xl font-bold" style={{ color: '#FF6E40' }}>
                    {placements.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Total Capacity</p>
                  <p className="text-3xl font-bold" style={{ color: '#FFC13B' }}>
                    {placements.reduce((sum, p) => sum + p.capacity, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1E3D59', opacity: 0.7 }}>Assigned Learners</p>
                  <p className="text-3xl font-bold" style={{ color: '#1E3D59' }}>
                    {placements.reduce((sum, p) => sum + p.assignedLearners, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="relative">
          <div className="rounded-2xl p-6 border shadow-lg" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#1E3D59', opacity: 0.5 }} />
                  <input
                    type="text"
                    placeholder="Search by company, suburb, or province..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'rgba(30, 61, 89, 0.2)',
                      backgroundColor: 'white',
                      color: '#1E3D59'
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5" style={{ color: '#1E3D59', opacity: 0.7 }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: 'rgba(30, 61, 89, 0.2)',
                    backgroundColor: 'white',
                    color: '#1E3D59'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Placements Table */}
        <div className="relative">
          <div className="rounded-2xl border shadow-lg" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 61, 89, 0.1)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                  Placements ({filteredPlacements.length})
                </h2>
              </div>
            </div>
            <div className="p-6">
              {filteredPlacements.length > 0 ? (
                <div className="space-y-6">
                  {filteredPlacements.map((placement) => (
                    <div
                      key={placement.id}
                      className="group relative p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ backgroundColor: 'white', borderColor: 'rgba(30, 61, 89, 0.1)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1" style={{ color: '#1E3D59' }}>
                                <button
                                  onClick={() => router.push(`/admin/placements/${placement.id}`)}
                                  className="hover:opacity-80 transition-opacity"
                                  style={{ color: '#FF6E40' }}
                                >
                                  {placement.companyName}
                                </button>
                              </h3>
                              <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>
                                {placement.suburb}, {placement.province}
                              </p>
                            </div>
                            <div className="px-3 py-1 rounded-full text-sm font-semibold" style={{ 
                              backgroundColor: placement.status === 'active' ? 'rgba(255, 110, 64, 0.1)' : 
                                             placement.status === 'full' ? 'rgba(255, 192, 59, 0.1)' : 
                                             'rgba(30, 61, 89, 0.1)',
                              color: placement.status === 'active' ? '#FF6E40' : 
                                     placement.status === 'full' ? '#FFC13B' : 
                                     '#1E3D59'
                            }}>
                              {placement.status}
                            </div>
                          </div>

                          <div className="flex items-center space-x-8 text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" style={{ color: '#FF6E40' }} />
                              <span>{placement.address}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" style={{ color: '#FFC13B' }} />
                              <span>{placement.assignedLearners} / {placement.capacity} learners</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span style={{ color: '#1E3D59', opacity: 0.7 }}>Capacity Progress</span>
                              <span className="font-semibold" style={{ color: '#1E3D59' }}>
                                {placement.assignedLearners} / {placement.capacity}
                              </span>
                            </div>
                            <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
                              <div
                                className="h-3 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${getProgressPercentage(placement.assignedLearners, placement.capacity)}%`,
                                  backgroundColor: getProgressPercentage(placement.assignedLearners, placement.capacity) > 80 ? '#FF6E40' : '#FFC13B'
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 ml-6">
                          <Button
                            onClick={() => router.push(`/admin/placements/${placement.id}`)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
                            style={{ 
                              borderColor: 'rgba(30, 61, 89, 0.2)',
                              color: '#1E3D59'
                            }}
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
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
                    <Building2 className="h-10 w-10" style={{ color: '#1E3D59', opacity: 0.5 }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1E3D59' }}>No placements found</h3>
                  <p className="mb-6" style={{ color: '#1E3D59', opacity: 0.7 }}>Create your first placement to get started</p>
                  <Button
                    onClick={() => router.push('/admin/placements/create')}
                    className="transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: '#FF6E40' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Placement
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

