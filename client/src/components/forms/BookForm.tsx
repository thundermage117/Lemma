import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Input'
import type { Book, CreateBookInput } from '../../types'

interface BookFormProps {
  initialValues?: Partial<Book>
  onSubmit: (data: CreateBookInput) => Promise<void>
  onCancel: () => void
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'reading', label: 'Reading' },
  { value: 'paused', label: 'Paused' },
  { value: 'finished', label: 'Finished' },
]

export function BookForm({ initialValues, onSubmit, onCancel }: BookFormProps) {
  const [form, setForm] = useState<CreateBookInput>({
    title: initialValues?.title ?? '',
    author: initialValues?.author ?? '',
    subject: initialValues?.subject ?? '',
    description: initialValues?.description ?? '',
    pdfFilename: initialValues?.pdfFilename ?? '',
    totalPages: initialValues?.totalPages ?? undefined,
    currentPage: initialValues?.currentPage ?? 0,
    currentChapter: initialValues?.currentChapter ?? '',
    status: initialValues?.status ?? 'not_started',
    isActive: initialValues?.isActive ?? false,
  })
  const [loading, setLoading] = useState(false)

  const set = (key: keyof CreateBookInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} />
      <Input label="Author" required value={form.author} onChange={(e) => set('author', e.target.value)} />
      <Input label="Subject" required placeholder="e.g. Real Analysis" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
      <Textarea label="Description" rows={2} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
      <Input label="PDF Filename" placeholder="e.g. abbott.pdf" value={form.pdfFilename ?? ''} onChange={(e) => set('pdfFilename', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Total Pages" type="number" min={0} value={form.totalPages ?? ''} onChange={(e) => set('totalPages', e.target.value ? Number(e.target.value) : undefined)} />
        <Input label="Current Page" type="number" min={0} value={form.currentPage} onChange={(e) => set('currentPage', Number(e.target.value))} />
      </div>
      <Input label="Current Chapter" placeholder="e.g. Chapter 3" value={form.currentChapter ?? ''} onChange={(e) => set('currentChapter', e.target.value)} />
      <Select label="Status" value={form.status} options={statusOptions} onChange={(e) => set('status', e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
        Set as current book
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initialValues ? 'Save Changes' : 'Add Book'}</Button>
      </div>
    </form>
  )
}
