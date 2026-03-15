import { useState } from 'react'
import { useTopics } from '../hooks/useTopics'
import { useBooks } from '../hooks/useBooks'
import { TopicForm } from '../components/forms/TopicForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { MarkdownContent } from '../components/ui/MarkdownContent'
import type { Topic, CreateTopicInput, UpdateTopicInput } from '../types'

const STATUSES = ['learning', 'revised', 'strong'] as const

export function Topics() {
  const { topics, loading, error, createTopic, updateTopic, deleteTopic } = useTopics()
  const { books } = useBooks()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Topic | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const handleCreate = async (data: CreateTopicInput) => {
    await createTopic(data)
    setIsOpen(false)
  }

  const handleUpdate = async (data: UpdateTopicInput) => {
    if (!editing) return
    await updateTopic(editing.id, data)
    setEditing(null)
  }

  const handleDelete = async (topic: Topic) => {
    if (!confirm(`Delete "${topic.title}"?`)) return
    await deleteTopic(topic.id)
  }

  const filtered = filterStatus ? topics.filter((t) => t.status === filterStatus) : topics

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading...</div>
  if (error) return <div className="p-8 text-red-500 text-sm">Error: {error}</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Topic Notes</h1>
          <p className="text-slate-500 text-sm mt-1">{topics.length} topic{topics.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>+ New Topic</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterStatus ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >All</button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s === filterStatus ? '' : s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No topics yet</p>
          <p className="text-sm mt-1">Create a topic to start organising your notes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((topic) => (
            <div key={topic.id} className="bg-white rounded-xl border border-slate-200">
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpanded(expanded === topic.id ? null : topic.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-slate-900">{topic.title}</h2>
                      <Badge value={topic.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{topic.subject}</p>
                    {topic.summary && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">{topic.summary}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {topic.book && (
                        <span className="text-xs text-slate-400">{topic.book.title}</span>
                      )}
                      {(topic.pageStart || topic.pageEnd) && (
                        <span className="text-xs text-slate-400">
                          pp. {topic.pageStart}–{topic.pageEnd}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Confidence</p>
                      <p className="text-lg font-bold text-indigo-600">{topic.confidenceLevel}<span className="text-xs text-slate-400">/10</span></p>
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded === topic.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {expanded === topic.id && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                  {topic.notes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                      <MarkdownContent content={topic.notes} className="text-sm text-slate-700" />
                    </div>
                  )}
                  {topic.examples && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Examples</p>
                      <MarkdownContent content={topic.examples} className="text-sm text-slate-700" />
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setEditing(topic) }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(topic) }}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Topic" size="lg">
        <TopicForm books={books} onSubmit={handleCreate} onCancel={() => setIsOpen(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Topic" size="lg">
        {editing && (
          <TopicForm
            key={editing.id}
            initialValues={editing}
            books={books}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
