'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { Program } from '@/lib/program-service'

interface ProgramModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (programData: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  program?: Program | null
  title: string
}

export function ProgramModal({ isOpen, onClose, onSave, program, title }: ProgramModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    level: '',
    available: true,
    maxStudents: 0,
    requirements: [] as string[],
    curriculum: [] as string[]
  })
  const [newRequirement, setNewRequirement] = useState('')
  const [newCurriculumItem, setNewCurriculumItem] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || '',
        description: program.description || '',
        duration: program.duration || '',
        level: program.level || '',
        available: program.available !== false,
        maxStudents: program.maxStudents || 0,
        requirements: program.requirements || [],
        curriculum: program.curriculum || []
      })
    } else {
      setFormData({
        name: '',
        description: '',
        duration: '',
        level: '',
        available: true,
        maxStudents: 0,
        requirements: [],
        curriculum: []
      })
    }
  }, [program])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving program:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addCurriculumItem = () => {
    if (newCurriculumItem.trim()) {
      setFormData(prev => ({
        ...prev,
        curriculum: [...prev.curriculum, newCurriculumItem.trim()]
      }))
      setNewCurriculumItem('')
    }
  }

  const removeCurriculumItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter program name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 12 months"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 0 }))}
                placeholder="Maximum number of students"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter program description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
            />
            <Label htmlFor="available">Available for enrollment</Label>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Requirements</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add requirement"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {req}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeRequirement(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Curriculum</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newCurriculumItem}
                  onChange={(e) => setNewCurriculumItem(e.target.value)}
                  placeholder="Add curriculum item"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCurriculumItem())}
                />
                <Button type="button" onClick={addCurriculumItem} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.curriculum.map((item, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeCurriculumItem(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Saving...' : 'Save Program'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
