import { useState } from 'react'
import { useJournal } from '../hooks/useJournal'
import { useBooks } from '../hooks/useBooks'
import { useTopics } from '../hooks/useTopics'
import { JournalForm } from '../components/forms/JournalForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import type { JournalEntry, CreateJournalInput, UpdateJournalInput } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function isToday(iso: string) {
  const today = new Date().toISOString().slice(0, 10)
  return iso.slice(0, 10) === today
}

export function Journal() {
  const { entries, loading, error, createEntry, updateEntry, deleteEntry } = useJournal()
  const { books } = useBooks()
  const { topics } = useTopics()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)

  const handleCreate = async (data: CreateJournalInput) => {
    await createEntry(data)
    setIsOpen(false)
  }

  const handleUpdate = async (data: UpdateJournalInput) => {
    if (!editing) return
    await updateEntry(editing.id, data)
    setEditing(null)
  }

  const handleDelete = async (entry: JournalEntry) => {
    if (!confirm('Delete this journal entry?')) return
    await deleteEntry(entry.id)
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading...</div>
  if (error) return <div className="p-8 text-red-500 text-sm">Error: {error}</div>

  const todayEntry = entries.find((e) => isToday(e.date))

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Reflection</h1>
          <p className="text-slate-500 text-sm mt-1">{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          {todayEntry ? 'New Entry' : '+ Today\'s Entry'}
        </Button>
      </div>

      {!todayEntry && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800 font-medium">No entry for today yet.</p>
          <p className="text-xs text-amber-600 mt-0.5">Log your study session to keep your streak going.</p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No entries yet</p>
          <p className="text-sm mt-1">Write your first daily reflection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className={`bg-white rounded-xl border p-6 ${isToday(entry.date) ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {formatDate(entry.date)}
                    {isToday(entry.date) && (
                      <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Today</span>
                    )}
                  </p>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    {entry.pagesRead != null && <span>{entry.pagesRead} pages</span>}
                    {entry.durationMinutes != null && <span>{entry.durationMinutes} min</span>}
                    {entry.book && <span>{entry.book.title}</span>}
                    {entry.topic && <span>· {entry.topic.title}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(entry)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(entry)}>Delete</Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">What I Studied</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.whatIStudied}</p>
                </div>
                {entry.whatConfusedMe && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">What Confused Me</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.whatConfusedMe}</p>
                  </div>
                )}
                {entry.oneThingIUnderstood && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">One Thing I Understood</p>
                    <p className="text-sm text-emerald-700 whitespace-pre-wrap">{entry.oneThingIUnderstood}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Journal Entry" size="lg">
        <JournalForm books={books} topics={topics} onSubmit={handleCreate} onCancel={() => setIsOpen(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Entry" size="lg">
        {editing && (
          <JournalForm
            key={editing.id}
            initialValues={editing}
            books={books}
            topics={topics}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
