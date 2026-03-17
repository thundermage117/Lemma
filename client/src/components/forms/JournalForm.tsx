import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Input'
import type { JournalEntry, CreateJournalInput, Book, Topic } from '../../types'

interface JournalFormProps {
  initialValues?: Partial<JournalEntry>
  books: Book[]
  topics: Topic[]
  onSubmit: (data: CreateJournalInput) => Promise<void>
  onCancel: () => void
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export function JournalForm({ initialValues, books, topics, onSubmit, onCancel }: JournalFormProps) {
  const [form, setForm] = useState<CreateJournalInput>({
    date: initialValues?.date ? initialValues.date.slice(0, 10) : todayString(),
    whatIStudied: initialValues?.whatIStudied ?? '',
    whatConfusedMe: initialValues?.whatConfusedMe ?? '',
    oneThingIUnderstood: initialValues?.oneThingIUnderstood ?? '',
    pagesRead: initialValues?.pagesRead ?? null,
    linkedBookId: initialValues?.linkedBookId ?? null,
    linkedTopicId: initialValues?.linkedTopicId ?? null,
    durationMinutes: initialValues?.durationMinutes ?? null,
  })
  const [loading, setLoading] = useState(false)

  const set = (key: keyof CreateJournalInput, value: unknown) =>
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
      <Input label="Date" type="date" required value={form.date as string}
        onChange={(e) => set('date', e.target.value)} />
      <Textarea label="What I Studied" required rows={3}
        placeholder="What did you study today?"
        value={form.whatIStudied} onChange={(e) => set('whatIStudied', e.target.value)} />
      <Textarea label="What Confused Me" rows={2}
        placeholder="What didn't quite click?"
        value={form.whatConfusedMe ?? ''} onChange={(e) => set('whatConfusedMe', e.target.value)} />
      <Textarea label="One Thing I Understood" rows={2}
        placeholder="One insight or breakthrough..."
        value={form.oneThingIUnderstood ?? ''} onChange={(e) => set('oneThingIUnderstood', e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Pages Read" type="number" min={0} value={form.pagesRead ?? ''}
          onChange={(e) => set('pagesRead', e.target.value ? Number(e.target.value) : null)} />
        <Input label="Duration (min)" type="number" min={0} value={form.durationMinutes ?? ''}
          onChange={(e) => set('durationMinutes', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select label="Linked Book" value={form.linkedBookId ? String(form.linkedBookId) : ''}
          options={bookOptions}
          onChange={(e) => set('linkedBookId', e.target.value ? Number(e.target.value) : null)} />
        <Select label="Linked Topic" value={form.linkedTopicId ? String(form.linkedTopicId) : ''}
          options={topicOptions}
          onChange={(e) => set('linkedTopicId', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto justify-center">Cancel</Button>
        <Button type="submit" loading={loading} className="w-full sm:w-auto justify-center">{initialValues ? 'Save Changes' : 'Save Entry'}</Button>
      </div>
    </form>
  )
}
