import { useState } from 'react'
import type { Question, CreateQuestionInput } from '../../types'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Input'

interface OpenQuestionsWidgetProps {
  questions: Question[]
  onAdd: (data: CreateQuestionInput) => Promise<void>
  onResolve: (id: number) => Promise<void>
}

export function OpenQuestionsWidget({ questions, onAdd, onResolve }: OpenQuestionsWidgetProps) {
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setAdding(true)
    try {
      await onAdd({ text: text.trim(), status: 'open' })
      setText('')
      setShowForm(false)
    } finally {
      setAdding(false)
    }
  }

  const open = questions.filter((q) => q.status === 'open')

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Questions</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2">
          <Textarea
            rows={2}
            placeholder="What don't you understand yet?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" size="sm" loading={adding}>Save Question</Button>
        </form>
      )}

      {open.length === 0 ? (
        <p className="text-sm text-slate-400">No open questions.</p>
      ) : (
        <ul className="space-y-2">
          {open.slice(0, 5).map((q) => (
            <li key={q.id} className="flex items-start gap-2 group">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
              <p className="text-sm text-slate-700 flex-1 leading-snug">{q.text}</p>
              <button
                onClick={() => onResolve(q.id)}
                className="text-xs text-slate-400 hover:text-emerald-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                title="Mark as understood"
              >
                ✓
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
