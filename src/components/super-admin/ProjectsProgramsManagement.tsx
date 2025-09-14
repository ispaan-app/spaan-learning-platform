'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Building2, 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'inactive'
}

interface Program {
  id: string
  name: string
  description: string
  projectId?: string
  projectName?: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'inactive'
}

export function ProjectsProgramsManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showProgramDialog, setShowProgramDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const toast = useToast()

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  })

  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    projectId: '',
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [projectsSnapshot, programsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'programs'), orderBy('createdAt', 'desc')))
      ])

      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[]

      const programsData = programsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        projectName: projectsData.find(p => p.id === doc.data().projectId)?.name
      })) as Program[]

      setProjects(projectsData)
      setPrograms(programsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load projects and programs')
    } finally {
      setLoading(false)
    }
  }

  const generateAIDescription = async (type: 'project' | 'program', name: string) => {
    setAiGenerating(true)
    try {
      // Simulate AI generation (replace with actual AI call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generatedDescription = type === 'project' 
        ? `A comprehensive ${name} initiative designed to address key challenges and deliver measurable outcomes. This project focuses on strategic implementation, stakeholder engagement, and sustainable development practices.`
        : `An intensive ${name} program providing hands-on training, theoretical knowledge, and practical experience. Students will gain industry-relevant skills and prepare for successful careers in their chosen field.`

      if (type === 'project') {
        setProjectForm(prev => ({ ...prev, description: generatedDescription }))
      } else {
        setProgramForm(prev => ({ ...prev, description: generatedDescription }))
      }

      toast.success('AI-generated description created successfully!')
    } catch (error) {
      console.error('Error generating description:', error)
      toast.error('Failed to generate AI description')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectForm.name.trim()) return

    setActionLoading('create-project')
    try {
      const projectData = {
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        status: projectForm.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'projects'), projectData)
      toast.success('Project created successfully!')
      setProjectForm({ name: '', description: '', status: 'active' })
      setShowProjectDialog(false)
      loadData()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!programForm.name.trim()) return

    setActionLoading('create-program')
    try {
      const programData = {
        name: programForm.name.trim(),
        description: programForm.description.trim(),
        projectId: programForm.projectId || null,
        status: programForm.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'programs'), programData)
      toast.success('Program created successfully!')
      setProgramForm({ name: '', description: '', projectId: '', status: 'active' })
      setShowProgramDialog(false)
      loadData()
    } catch (error) {
      console.error('Error creating program:', error)
      toast.error('Failed to create program')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return

    try {
      await deleteDoc(doc(db, 'projects', projectId))
      toast.success('Project deleted successfully!')
      loadData()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) return

    try {
      await deleteDoc(doc(db, 'programs', programId))
      toast.success('Program deleted successfully!')
      loadData()
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Failed to delete program')
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Loading projects and programs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold text-green-600">{programs.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-2xl font-bold text-purple-600">{programs.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Projects</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4" />
            <span>Programs</span>
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Gauteng Digital Skills Initiative"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="projectDescription">Description</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateAIDescription('project', projectForm.name)}
                        disabled={!projectForm.name.trim() || aiGenerating}
                      >
                        {aiGenerating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea
                      id="projectDescription"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the project objectives, scope, and expected outcomes..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectStatus">Status</Label>
                    <Select 
                      value={projectForm.status} 
                      onValueChange={(value: 'active' | 'inactive') => setProjectForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setShowProjectDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading === 'create-project'}>
                      {actionLoading === 'create-project' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Project'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No projects match your search criteria.' : 'Get started by creating your first project.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Dialog open={showProgramDialog} onOpenChange={setShowProgramDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Program</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProgram} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="programName">Program Name</Label>
                      <Input
                        id="programName"
                        value={programForm.name}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Software Development"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="programProject">Associated Project</Label>
                      <Select 
                        value={programForm.projectId} 
                        onValueChange={(value) => setProgramForm(prev => ({ ...prev, projectId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="programDescription">Description</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateAIDescription('program', programForm.name)}
                        disabled={!programForm.name.trim() || aiGenerating}
                      >
                        {aiGenerating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea
                      id="programDescription"
                      value={programForm.description}
                      onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the program curriculum, learning outcomes, and career prospects..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="programStatus">Status</Label>
                    <Select 
                      value={programForm.status} 
                      onValueChange={(value: 'active' | 'inactive') => setProgramForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setShowProgramDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading === 'create-program'}>
                      {actionLoading === 'create-program' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Program'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      {program.projectName && (
                        <Badge variant="outline" className="mt-2">
                          {program.projectName}
                        </Badge>
                      )}
                      <Badge variant={program.status === 'active' ? 'default' : 'secondary'} className="mt-2 ml-2">
                        {program.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProgram(program.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3">{program.description}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    Created: {new Date(program.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No programs match your search criteria.' : 'Get started by creating your first program.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


