import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Input'
import type { Problem, CreateProblemInput, Book, Topic } from '../../types'

interface ProblemFormProps {
  initialValues?: Partial<Problem>
  books: Book[]
  topics: Topic[]
  onSubmit: (data: CreateProblemInput) => Promise<void>
  onCancel: () => void
}

const sourceOptions = [
  { value: 'textbook', label: 'Textbook' },
  { value: 'self', label: 'Self-made' },
  { value: 'other', label: 'Other' },
]
const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]
const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'solved', label: 'Solved' },
  { value: 'solved_with_help', label: 'Solved with Help' },
  { value: 'revisit', label: 'Revisit' },
]

export function ProblemForm({ initialValues, books, topics, onSubmit, onCancel }: ProblemFormProps) {
  const [form, setForm] = useState<CreateProblemInput>({
    title: initialValues?.title ?? '',
    sourceType: initialValues?.sourceType ?? 'textbook',
    linkedBookId: initialValues?.linkedBookId ?? null,
    topicId: initialValues?.topicId ?? null,
    chapterOrSection: initialValues?.chapterOrSection ?? '',
    pageNumber: initialValues?.pageNumber ?? null,
    problemStatement: initialValues?.problemStatement ?? '',
    difficulty: initialValues?.difficulty ?? 'medium',
    tags: initialValues?.tags ?? [],
    status: initialValues?.status ?? 'not_started',
    attemptNotes: initialValues?.attemptNotes ?? '',
    finalSolution: initialValues?.finalSolution ?? '',
    mistakesMade: initialValues?.mistakesMade ?? '',
    revisitDate: initialValues?.revisitDate ?? null,
  })
  const [tagInput, setTagInput] = useState((initialValues?.tags ?? []).join(', '))
  const [loading, setLoading] = useState(false)

  const set = (key: keyof CreateProblemInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleTagChange = (val: string) => {
    setTagInput(val)
    set('tags', val.split(',').map((t) => t.trim()).filter(Boolean))
  }

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
      <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} />
      <Textarea label="Problem Statement" required rows={3} placeholder="Use Markdown + LaTeX, e.g. Prove $\\lim_{x\\to 0} \\frac{\\sin x}{x}=1$"
        value={form.problemStatement}
        onChange={(e) => set('problemStatement', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Source" value={form.sourceType} options={sourceOptions}
          onChange={(e) => set('sourceType', e.target.value)} />
        <Select label="Difficulty" value={form.difficulty} options={difficultyOptions}
          onChange={(e) => set('difficulty', e.target.value)} />
      </div>
      <Select label="Status" value={form.status} options={statusOptions}
        onChange={(e) => set('status', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Linked Book" value={form.linkedBookId ? String(form.linkedBookId) : ''}
          options={bookOptions}
          onChange={(e) => set('linkedBookId', e.target.value ? Number(e.target.value) : null)} />
        <Select label="Linked Topic" value={form.topicId ? String(form.topicId) : ''}
          options={topicOptions}
          onChange={(e) => set('topicId', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Chapter / Section" value={form.chapterOrSection ?? ''}
          onChange={(e) => set('chapterOrSection', e.target.value)} />
        <Input label="Page Number" type="number" min={1} value={form.pageNumber ?? ''}
          onChange={(e) => set('pageNumber', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <Input label="Tags" placeholder="e.g. continuity, limits, epsilon-delta"
        value={tagInput} onChange={(e) => handleTagChange(e.target.value)} />
      <Textarea label="Attempt Notes" rows={2} placeholder="Markdown + LaTeX supported" value={form.attemptNotes ?? ''}
        onChange={(e) => set('attemptNotes', e.target.value)} />
      <Textarea label="Final Solution" rows={3} placeholder="Markdown + LaTeX supported" value={form.finalSolution ?? ''}
        onChange={(e) => set('finalSolution', e.target.value)} />
      <Textarea label="Mistakes Made" rows={2} value={form.mistakesMade ?? ''}
        onChange={(e) => set('mistakesMade', e.target.value)} />
      <Input label="Revisit Date" type="date" value={form.revisitDate ? form.revisitDate.slice(0, 10) : ''}
        onChange={(e) => set('revisitDate', e.target.value || null)} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initialValues ? 'Save Changes' : 'Add Problem'}</Button>
      </div>
    </form>
  )
}
