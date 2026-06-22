// app/admin/skills/page.tsx
'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Edit, Trash2, GripVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import type { SkillCategory, SkillDto } from '@/types/api'
const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Other']
const PROFICIENCY = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']

type SkillForm = { name: string; category: SkillCategory; proficiencyLevel: number; iconUrl: string }
const EMPTY: SkillForm = { name: '', category: 'Frontend', proficiencyLevel: 3, iconUrl: '' }

export default function AdminSkillsPage() {
  const qc = useQueryClient()

  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('all')
  const [open,       setOpen]       = useState(false)
  const [editing,    setEditing]    = useState<SkillDto | null>(null)
  const [deleteItem, setDeleteItem] = useState<SkillDto | null>(null)
  const [form,       setForm]       = useState<SkillForm>(EMPTY)

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['admin-skills'],
    queryFn:  adminService.getAdminSkills,
  })

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (catFilter === 'all' || s.category === catFilter)
  )

  // Group by category
  const grouped = CATEGORIES.reduce<Record<string, SkillDto[]>>((acc, cat) => {
    const items = filtered.filter(s => s.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-skills'] })

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name, category: form.category,
        proficiencyLevel: form.proficiencyLevel,
        iconUrl: form.iconUrl || undefined,
      }
      return editing
        ? adminService.updateSkill(editing.id, payload)
        : adminService.createSkill(payload)
    },
    onSuccess: () => { invalidate(); toast.success(editing ? 'Updated.' : 'Created.'); setOpen(false) },
    onError: () => toast.error('Error occurred.'),
  })

  const deleteMut = useMutation({
    mutationFn: adminService.deleteSkill,
    onSuccess: () => { invalidate(); toast.success('Deleted.'); setDeleteItem(null) },
  })

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit   = (s: SkillDto) => {
    setEditing(s)
    setForm({ name: s.name, category: s.category as SkillCategory, proficiencyLevel: s.proficiencyLevel, iconUrl: s.iconUrl ?? '' })
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground">Manage your skills and expertise levels</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Add Skill
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c === 'SoftSkills' ? 'Soft Skills' : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skills grouped by category */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">No skills found.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="space-y-3">
            <h2 className="text-lg font-semibold">{cat === 'SoftSkills' ? 'Soft Skills' : cat}</h2>
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]" />
                    <TableHead>Skill</TableHead>
                    <TableHead className="w-[240px]">Proficiency</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(skill => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-8 cursor-grab">
                          <GripVertical className="size-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={skill.proficiencyLevel * 20} className="flex-1" />
                          <span className="text-xs text-muted-foreground w-24">
                            {PROFICIENCY[skill.proficiencyLevel]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(skill)}>
                              <Edit className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteItem(skill)}
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update skill details.' : 'Add a new skill to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., React, Docker"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as SkillCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c === 'SoftSkills' ? 'Soft Skills' : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>
                Proficiency Level: <span className="text-accent">{PROFICIENCY[form.proficiencyLevel]}</span>
              </Label>
              <Slider
                value={[form.proficiencyLevel]}
                onValueChange={([v]) => setForm(f => ({ ...f, proficiencyLevel: v }))}
                min={1} max={5} step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !form.name}>
              {saveMut.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteItem?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteItem && deleteMut.mutate(deleteItem.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}