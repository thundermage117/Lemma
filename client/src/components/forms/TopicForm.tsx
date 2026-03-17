import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Input'
import type { Topic, CreateTopicInput, Book } from '../../types'

interface TopicFormProps {
  initialValues?: Partial<Topic>
  books: Book[]
  onSubmit: (data: CreateTopicInput) => Promise<void>
  onCancel: () => void
}

const statusOptions = [
  { value: 'learning', label: 'Learning' },
  { value: 'revised', label: 'Revised' },
  { value: 'strong', label: 'Strong' },
]

export function TopicForm({ initialValues, books, onSubmit, onCancel }: TopicFormProps) {
  const [form, setForm] = useState<CreateTopicInput>({
    title: initialValues?.title ?? '',
    subject: initialValues?.subject ?? '',
    summary: initialValues?.summary ?? '',
    notes: initialValues?.notes ?? '',
    examples: initialValues?.examples ?? '',
    confidenceLevel: initialValues?.confidenceLevel ?? 5,
    linkedBookId: initialValues?.linkedBookId ?? null,
    pageStart: initialValues?.pageStart ?? null,
    pageEnd: initialValues?.pageEnd ?? null,
    status: initialValues?.status ?? 'learning',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: keyof CreateTopicInput, value: unknown) =>
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

  const bookOptions = [
    { value: '', label: 'No book linked' },
    ...books.map((b) => ({ value: String(b.id), label: b.title })),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} />
      <Input label="Subject" required placeholder="e.g. Real Analysis" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
      <Textarea label="Summary" rows={2} placeholder="One-line description" value={form.summary ?? ''} onChange={(e) => set('summary', e.target.value)} />
      <Textarea label="Notes" rows={4} placeholder="Detailed notes, definitions, theorems... (Markdown + LaTeX supported, e.g. $\\epsilon$-$\\delta$)" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      <Textarea label="Examples" rows={3} placeholder="Worked examples... (Markdown + LaTeX supported)" value={form.examples ?? ''} onChange={(e) => set('examples', e.target.value)} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">
          Confidence Level: <span className="text-indigo-600 font-semibold">{form.confidenceLevel}/10</span>
        </label>
        <input type="range" min={1} max={10} value={form.confidenceLevel}
          onChange={(e) => set('confidenceLevel', Number(e.target.value))}
          className="w-full accent-indigo-600" />
      </div>
      <Select label="Status" value={form.status} options={statusOptions} onChange={(e) => set('status', e.target.value)} />
      <Select label="Linked Book" value={form.linkedBookId ? String(form.linkedBookId) : ''}
        options={bookOptions}
        onChange={(e) => set('linkedBookId', e.target.value ? Number(e.target.value) : null)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Page Start" type="number" min={1} value={form.pageStart ?? ''}
          onChange={(e) => set('pageStart', e.target.value ? Number(e.target.value) : null)} />
        <Input label="Page End" type="number" min={1} value={form.pageEnd ?? ''}
          onChange={(e) => set('pageEnd', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto justify-center">Cancel</Button>
        <Button type="submit" loading={loading} className="w-full sm:w-auto justify-center">{initialValues ? 'Save Changes' : 'Add Topic'}</Button>
      </div>
    </form>
  )
}
