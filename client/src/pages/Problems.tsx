import { useState } from 'react'
import { useProblems } from '../hooks/useProblems'
import { useBooks } from '../hooks/useBooks'
import { useTopics } from '../hooks/useTopics'
import { ProblemForm } from '../components/forms/ProblemForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { MarkdownContent } from '../components/ui/MarkdownContent'
import type { Problem, CreateProblemInput, UpdateProblemInput, ProblemStatus, Difficulty } from '../types'

const STATUSES: ProblemStatus[] = ['not_started', 'attempted', 'solved', 'solved_with_help', 'revisit']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export function Problems() {
  const [filterStatus, setFilterStatus] = useState<ProblemStatus | undefined>()
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | undefined>()
  const { problems, loading, error, createProblem, updateProblem, deleteProblem } = useProblems({
    status: filterStatus,
    difficulty: filterDifficulty,
  })
  const { books } = useBooks()
  const { topics } = useTopics()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Problem | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const handleCreate = async (data: CreateProblemInput) => {
    await createProblem(data)
    setIsOpen(false)
  }

  const handleUpdate = async (data: UpdateProblemInput) => {
    if (!editing) return
    await updateProblem(editing.id, data)
    setEditing(null)
  }

  const handleDelete = async (problem: Problem) => {
    if (!confirm(`Delete "${problem.title}"?`)) return
    await deleteProblem(problem.id)
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading...</div>
  if (error) return <div className="p-8 text-red-500 text-sm">Error: {error}</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Problem Log</h1>
          <p className="text-slate-500 text-sm mt-1">{problems.length} problem{problems.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>+ Log Problem</Button>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-6">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-400 self-center mr-1">Status:</span>
          <button onClick={() => setFilterStatus(undefined)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!filterStatus ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            All
          </button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s === filterStatus ? undefined : s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Badge value={s} />
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-400 self-center mr-1">Difficulty:</span>
          <button onClick={() => setFilterDifficulty(undefined)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!filterDifficulty ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            All
          </button>
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => setFilterDifficulty(d === filterDifficulty ? undefined : d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterDifficulty === d ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Badge value={d} />
            </button>
          ))}
        </div>
      </div>

      {problems.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No problems found</p>
          <p className="text-sm mt-1">Log a practice problem to track your work.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map((problem) => (
            <div key={problem.id} className={`bg-white rounded-xl border ${problem.status === 'revisit' ? 'border-orange-300 ring-1 ring-orange-100' : 'border-slate-200'}`}>
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === problem.id ? null : problem.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{problem.title}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{problem.problemStatement}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {problem.book && <span className="text-xs text-slate-400">{problem.book.title}</span>}
                      {problem.topic && <span className="text-xs text-slate-400">· {problem.topic.title}</span>}
                      {problem.chapterOrSection && <span className="text-xs text-slate-400">· {problem.chapterOrSection}</span>}
                      {problem.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0 items-start">
                    <Badge value={problem.difficulty} />
                    <Badge value={problem.status} />
                  </div>
                </div>
              </div>

              {expanded === problem.id && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Problem Statement</p>
                    <MarkdownContent content={problem.problemStatement} className="text-sm text-slate-700" />
                  </div>
                  {problem.attemptNotes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Attempt Notes</p>
                      <MarkdownContent content={problem.attemptNotes} className="text-sm text-slate-700" />
                    </div>
                  )}
                  {problem.finalSolution && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Solution</p>
                      <MarkdownContent content={problem.finalSolution} className="text-sm text-slate-700" />
                    </div>
                  )}
                  {problem.mistakesMade && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mistakes</p>
                      <MarkdownContent content={problem.mistakesMade} className="text-sm text-amber-700" />
                    </div>
                  )}
                  {problem.revisitDate && (
                    <p className="text-xs text-orange-500">Revisit: {new Date(problem.revisitDate).toLocaleDateString()}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setEditing(problem) }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(problem) }}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Log Problem" size="lg">
        <ProblemForm books={books} topics={topics} onSubmit={handleCreate} onCancel={() => setIsOpen(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Problem" size="lg">
        {editing && (
          <ProblemForm
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
