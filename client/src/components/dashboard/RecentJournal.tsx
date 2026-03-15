import type { JournalEntry } from '../../types'
import { Link } from 'react-router-dom'

interface RecentJournalProps {
  entries: JournalEntry[]
  todayJournal: JournalEntry | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RecentJournal({ entries, todayJournal }: RecentJournalProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Reflection</p>
        <Link to="/journal" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          View all
        </Link>
      </div>

      {!todayJournal && (
        <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-xs text-amber-700 font-medium">No entry for today yet.</p>
          <Link to="/journal" className="text-xs text-amber-600 hover:underline">Write today's reflection →</Link>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">No journal entries yet.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="border-l-2 border-slate-200 pl-3">
              <p className="text-xs text-slate-400 mb-0.5">{formatDate(e.date)}</p>
              <p className="text-sm text-slate-700 line-clamp-2">{e.whatIStudied}</p>
              {e.pagesRead && (
                <p className="text-xs text-slate-400 mt-0.5">{e.pagesRead} pages · {e.durationMinutes ? `${e.durationMinutes} min` : ''}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
