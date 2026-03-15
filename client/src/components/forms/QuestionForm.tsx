import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Input'
import type { Question, CreateQuestionInput, Book, Topic } from '../../types'

interface QuestionFormProps {
  initialValues?: Partial<Question>
  books: Book[]
  topics: Topic[]
  onSubmit: (data: CreateQuestionInput) => Promise<void>
  onCancel: () => void
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'understood', label: 'Understood' },
  { value: 'revisit', label: 'Revisit' },
]

export function QuestionForm({ initialValues, books, topics, onSubmit, onCancel }: QuestionFormProps) {
  const [form, setForm] = useState<CreateQuestionInput>({
    text: initialValues?.text ?? '',
    linkedBookId: initialValues?.linkedBookId ?? null,
    linkedTopicId: initialValues?.linkedTopicId ?? null,
    pageNumber: initialValues?.pageNumber ?? null,
    status: initialValues?.status ?? 'open',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: keyof CreateQuestionInput, value: unknown) =>
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
    { value: '', label: 'No book' },
    ...books.map((b) => ({ value: String(b.id), label: b.title })),
  ]
  const topicOptions = [
    { value: '', label: 'No topic' },
    ...topics.map((t) => ({ value: String(t.id), label: t.title })),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea label="Question" required rows={3}
        placeholder="What don't you understand yet?"
        value={form.text} onChange={(e) => set('text', e.target.value)} />
      <Select label="Status" value={form.status} options={statusOptions}
        onChange={(e) => set('status', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Linked Book" value={form.linkedBookId ? String(form.linkedBookId) : ''}
          options={bookOptions}
          onChange={(e) => set('linkedBookId', e.target.value ? Number(e.target.value) : null)} />
        <Select label="Linked Topic" value={form.linkedTopicId ? String(form.linkedTopicId) : ''}
          options={topicOptions}
          onChange={(e) => set('linkedTopicId', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <Input label="Page Number" type="number" min={1} value={form.pageNumber ?? ''}
        onChange={(e) => set('pageNumber', e.target.value ? Number(e.target.value) : null)} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initialValues ? 'Save Changes' : 'Add Question'}</Button>
      </div>
    </form>
  )
}
