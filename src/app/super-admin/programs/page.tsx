'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ProgramService, Program } from '@/lib/program-service'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ProgramsManagementPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'maxStudents'>('name')

  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced']

  useEffect(() => {
    loadPrograms()
  }, [])

  useEffect(() => {
    filterAndSortPrograms()
  }, [programs, searchTerm, levelFilter, sortBy])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      const programsData = await ProgramService.getAllPrograms()
      setPrograms(programsData)
      console.log('Loaded programs:', programsData)
    } catch (error) {
      console.error('Error loading programs:', error)
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortPrograms = () => {
    let filtered = programs.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = levelFilter === 'all' || program.level === levelFilter
      return matchesSearch && matchesLevel
    })

    // Sort programs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'duration':
          return a.duration?.localeCompare(b.duration || '') || 0
        case 'maxStudents':
          return (b.maxStudents || 0) - (a.maxStudents || 0)
        default:
          return 0
      }
    })

    setFilteredPrograms(filtered)
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewProgram = (program: Program) => {
    // TODO: Implement program details modal
    toast.info(`Viewing ${program.name}`)
  }

  const handleEditProgram = (program: Program) => {
    // TODO: Implement program edit modal
    toast.info(`Editing ${program.name}`)
  }

  const handleDeleteProgram = (program: Program) => {
    // TODO: Implement program deletion
    toast.info(`Deleting ${program.name}`)
  }

  if (loading) {
    return (
      <AdminLayout userRole="super-admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Programs Management</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Programs Management</h1>
            <p className="text-gray-600 mt-2">Manage and view all available programs</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Program</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Programs</p>
                  <p className="text-2xl font-bold">{programs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold">
                    {programs.reduce((sum, program) => sum + (program.maxStudents || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {programs.length > 0 
                      ? Math.round(programs.reduce((sum, program) => {
                          const duration = parseInt(program.duration?.split(' ')[0] || '0')
                          return sum + duration
                        }, 0) / programs.length)
                      : 0} months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold">
                    {programs.filter(p => p.available !== false).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="duration">Sort by Duration</option>
                  <option value="maxStudents">Sort by Capacity</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{program.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {program.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewProgram(program)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProgram(program)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Program
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProgram(program)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Program
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Level Badge */}
                  {program.level && (
                    <Badge className={getLevelBadgeColor(program.level)}>
                      {program.level}
                    </Badge>
                  )}

                  {/* Program Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{program.duration || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{program.maxStudents || 0} students</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={program.available !== false ? 'default' : 'secondary'}>
                        {program.available !== false ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>

                  {/* Requirements Preview */}
                  {program.requirements && program.requirements.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {program.requirements.slice(0, 2).map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {program.requirements.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{program.requirements.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewProgram(program)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditProgram(program)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrograms.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || levelFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No programs have been created yet.'
                }
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Program
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
