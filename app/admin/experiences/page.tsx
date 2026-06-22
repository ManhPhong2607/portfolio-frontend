// app/admin/experiences/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { ExperienceDto } from '@/types/api'

const EMPLOYMENT_TYPES = ['FullTime', 'PartTime', 'Internship', 'Freelance']
const EMPLOYMENT_LABELS: Record<string, string> = {
  FullTime: 'Full-time', PartTime: 'Part-time',
  Internship: 'Internship', Freelance: 'Freelance',
}

type ExpForm = {
  companyName: string; position: string; employmentType: string
  startDate: string; endDate: string; isCurrent: boolean
  location: string; description: string
}

const EMPTY_FORM: ExpForm = {
  companyName: '', position: '', employmentType: 'FullTime',
  startDate: '', endDate: '', isCurrent: true,
  location: '', description: '',
}

function formatPeriod(exp: ExperienceDto) {
  const start = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (exp.isCurrent) return `${start} – Present`
  const end = exp.endDate
    ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : ''
  return `${start} – ${end}`
}

export default function AdminExperiencesPage() {
  const qc = useQueryClient()

  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<ExperienceDto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm]         = useState<ExpForm>(EMPTY_FORM)

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn:  adminService.getAdminExperiences,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-experiences'] })

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = {
        companyName:    form.companyName,
        position:       form.position,
        employmentType: form.employmentType,
        startDate:      form.startDate,
        endDate:        form.isCurrent ? undefined : form.endDate || undefined,
        isCurrent:      form.isCurrent,
        location:       form.location  || undefined,
        description:    form.description || undefined,
      }
      return editing
        ? adminService.updateExperience(editing.id, payload)
        : adminService.createExperience(payload)
    },
    onSuccess: () => {
      invalidate()
      toast.success(editing ? 'Đã cập nhật.' : 'Đã tạo.')
      setOpen(false)
    },
    onError: () => toast.error('Có lỗi xảy ra.'),
  })

  const deleteMut = useMutation({
    mutationFn: adminService.deleteExperience,
    onSuccess: () => { invalidate(); toast.success('Đã xoá.') },
  })

  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setOpen(true)
  }

  const openEdit = (exp: ExperienceDto) => {
    setEditing(exp);

  // Chỉ lấy 10 ký tự đầu tiên: "2024-11-27T00:00:00Z" -> "2024-11-27"
  // Cách này KHÔNG qua trình xử lý múi giờ của JS, nên ngày sẽ KHÔNG bị nhảy
    const formatDateForInput = (dateString?: string) => {
       if (!dateString) return '';
       return dateString.substring(0, 10); 

    // setEditing(exp)
    // // Hàm phụ để format ngày về YYYY-MM-DD theo giờ địa phương
    // const toLocalDateString = (dateString: string) => {
    // const d = new Date(dateString);
    // // Sử dụng 'en-CA' để luôn trả về định dạng YYYY-MM-DD
    // return d.toLocaleDateString('en-CA');
  };
    setForm({
      companyName:    exp.companyName,
      position:       exp.position,
      employmentType: exp.employmentType,
      startDate:      formatDateForInput(exp.startDate),
      endDate:        formatDateForInput(exp.endDate || undefined),
      // startDate:      toLocalDateString(exp.startDate),
      // endDate:        exp.endDate ? toLocalDateString(exp.endDate) : '',
      // startDate:      exp.startDate.split('T')[0],
      // endDate:        exp.endDate ? exp.endDate.split('T')[0] : '',
      isCurrent:      exp.isCurrent,
      location:       exp.location    ?? '',
      description:    exp.description ?? '',
    });
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Experiences</h1>
          <p className="text-muted-foreground text-sm">{experiences.length} entries</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" /> Add Experience
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium">{exp.position}</span>
                      <span className="text-accent">· {exp.companyName}</span>
                      {exp.isCurrent && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {EMPLOYMENT_LABELS[exp.employmentType]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatPeriod(exp)}</span>
                      {exp.location && <span>· {exp.location}</span>}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(exp)}>
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(exp.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                  placeholder="Company name" />
              </div>
              <div className="space-y-2">
                <Label>Position *</Label>
                <Input value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  placeholder="Your role" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.employmentType}
                  onValueChange={v => setForm(f => ({ ...f, employmentType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{EMPLOYMENT_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="City, Country" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate}
                  disabled={form.isCurrent}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isCurrent}
                onCheckedChange={v => setForm(f => ({ ...f, isCurrent: v, endDate: v ? '' : f.endDate }))}
              />
              <Label>Currently working here</Label>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} rows={3}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe your responsibilities..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending || !form.companyName || !form.position || !form.startDate}
            >
              {saveMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá experience?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null) }}
            >Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}